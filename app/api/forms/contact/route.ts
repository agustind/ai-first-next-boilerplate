import { rateLimit } from '@/features/forms/rate-limit'
import { submitContact } from '@/features/forms/submit'

/** JSON API for the contact form, for agents and integrations. Documented in /openapi.json. */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const limited = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 10 * 60_000 })
  if (!limited.ok) {
    return Response.json(
      { ok: false, error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limited.retryAfterMs / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  const result = await submitContact(body, {
    channel: 'api',
    ip,
    page: request.headers.get('referer') ?? undefined,
  })

  if (result.ok) return Response.json({ ok: true }, { status: 201 })
  if (result.kind === 'invalid')
    return Response.json({ ok: false, fieldErrors: result.fieldErrors }, { status: 422 })
  if (result.kind === 'spam')
    return Response.json({ ok: false, error: 'rejected' }, { status: 422 })
  return Response.json({ ok: false, error: 'server_error' }, { status: 500 })
}
