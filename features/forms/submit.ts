import 'server-only'
import { z } from 'zod'
import { env } from '@/env'
import { getContentSource } from '@/features/cms'
import { type ContactInput, contactInputSchema, type FieldErrors } from './contact'
import { notifyByEmail } from './notify'
import { checkContent, checkHoneypot, checkTiming, type SpamVerdict, verifyTurnstile } from './spam'

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: 'invalid'; fieldErrors: FieldErrors }
  | { ok: false; kind: 'spam'; reason: string }
  | { ok: false; kind: 'error' }

type SubmitOptions = {
  /** `form` (browser, all checks) or `api` (agents/integrations: no honeypot/timing). */
  channel: 'form' | 'api'
  honeypot?: unknown
  startedAt?: unknown
  turnstileToken?: unknown
  ip?: string
  page?: string
}

/** Single pipeline for every contact submission: validate → spam checks → store → notify. */
export async function submitContact(raw: unknown, options: SubmitOptions): Promise<SubmitResult> {
  const parsed = contactInputSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      kind: 'invalid',
      fieldErrors: z.flattenError(parsed.error).fieldErrors as FieldErrors,
    }
  }
  const input: ContactInput = parsed.data

  const checks: SpamVerdict[] = [checkContent(input.message)]
  if (options.channel === 'form') {
    checks.push(checkHoneypot(options.honeypot), checkTiming(options.startedAt))
    checks.push(await verifyTurnstile(options.turnstileToken, env.TURNSTILE_SECRET_KEY, options.ip))
  }
  const failed = checks.find((check) => !check.ok)
  if (failed && !failed.ok) return { ok: false, kind: 'spam', reason: failed.reason }

  try {
    await getContentSource().submitForm({
      form: 'contact',
      data: input,
      page: options.page,
      submittedAt: new Date().toISOString(),
    })
    await notifyByEmail(input, options.page)
    return { ok: true }
  } catch (error) {
    console.error('[forms] submission failed', error)
    return { ok: false, kind: 'error' }
  }
}
