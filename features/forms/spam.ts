/**
 * Layered, privacy-friendly spam prevention. Cheap checks run first; Turnstile
 * is only consulted when configured.
 */

export type SpamVerdict = { ok: true } | { ok: false; reason: string }

const MIN_FILL_MS = 2500
const MAX_LINKS = 3

/** Bots fill every field; humans never see this one. */
export function checkHoneypot(value: unknown): SpamVerdict {
  return typeof value === 'string' && value.trim() !== ''
    ? { ok: false, reason: 'honeypot' }
    : { ok: true }
}

/** A human needs a few seconds to fill a form. `startedAt` is ms since epoch set on render. */
export function checkTiming(startedAt: unknown, now = Date.now()): SpamVerdict {
  const started = Number(startedAt)
  if (!Number.isFinite(started) || started <= 0) return { ok: false, reason: 'timing-missing' }
  if (now - started < MIN_FILL_MS) return { ok: false, reason: 'too-fast' }
  return { ok: true }
}

export function checkContent(text: string): SpamVerdict {
  const links = text.match(/https?:\/\//gi)?.length ?? 0
  if (links > MAX_LINKS) return { ok: false, reason: 'too-many-links' }
  return { ok: true }
}

/** Cloudflare Turnstile server-side verification. Skipped when no secret is configured. */
export async function verifyTurnstile(
  token: unknown,
  secret: string | undefined,
  ip?: string,
): Promise<SpamVerdict> {
  if (!secret) return { ok: true }
  if (typeof token !== 'string' || !token) return { ok: false, reason: 'turnstile-missing' }
  const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) })
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  })
  const result = (await response.json()) as { success?: boolean }
  return result.success ? { ok: true } : { ok: false, reason: 'turnstile-failed' }
}
