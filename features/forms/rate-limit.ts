/**
 * Best-effort in-memory sliding window. Per server instance only: good enough to
 * blunt bursts; put a shared store (e.g. Upstash) behind this for real limits.
 */
const hits = new Map<string, number[]>()

export function rateLimit(key: string, { limit = 5, windowMs = 60_000 } = {}, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
  if (recent.length >= limit) {
    hits.set(key, recent)
    return { ok: false as const, retryAfterMs: windowMs - (now - (recent[0] ?? now)) }
  }
  recent.push(now)
  hits.set(key, recent)
  return { ok: true as const }
}
