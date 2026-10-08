import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'
import { sanity } from 'next-sanity/live/cache-life'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // The Sanity Presentation tool previews the site in an iframe (embedded Studio
  // or a hosted *.sanity.studio). Everyone else is denied framing.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self' https://*.sanity.studio" },
]

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile in a parent folder would confuse detection).
  turbopack: { root: fileURLToPath(new URL('.', import.meta.url)) },
  cacheComponents: true,
  partialPrefetching: true,
  // `sanityFetch` tags every query; Live (or /api/revalidate) expires the tags.
  // Long-lived by default, event-driven freshness.
  cacheLife: { default: sanity },
  reactCompiler: true,
  typedRoutes: true,
  logging: { browserToTerminal: 'warn' },
  experimental: {
    // Two root layouts ((web) and studio) → unmatched URLs need a global 404.
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
