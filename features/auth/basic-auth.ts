/** HTTP basic auth for staging/preview deployments. Edge/Node compatible (no Buffer). */

export function parseBasicAuth(
  header: string | null,
): { username: string; password: string } | null {
  if (!header?.startsWith('Basic ')) return null
  try {
    const decoded = atob(header.slice(6).trim())
    const separator = decoded.indexOf(':')
    if (separator === -1) return null
    return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) }
  } catch {
    return null
  }
}

/** Constant-time string comparison so response timing doesn't leak the password. */
export function safeEqual(a: string, b: string) {
  const length = Math.max(a.length, b.length)
  let mismatch = a.length ^ b.length
  for (let i = 0; i < length; i++) mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  return mismatch === 0
}

export function isAuthorized(
  header: string | null,
  expected: { username: string; password: string },
) {
  const credentials = parseBasicAuth(header)
  if (!credentials) return false
  return (
    safeEqual(credentials.username, expected.username) &&
    safeEqual(credentials.password, expected.password)
  )
}

/** Machine endpoints that authenticate on their own and must bypass the gate. */
export const BASIC_AUTH_EXCLUDED = [/^\/api\/revalidate$/]
