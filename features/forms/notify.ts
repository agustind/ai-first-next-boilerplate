import 'server-only'
import { env } from '@/env'
import type { ContactInput } from './contact'

/** Email notification through the Resend REST API. No-op unless configured. */
export async function notifyByEmail(input: ContactInput, page?: string) {
  if (!env.RESEND_API_KEY || !env.FORMS_NOTIFY_EMAIL) return
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.FORMS_FROM_EMAIL ?? 'Website <onboarding@resend.dev>',
      to: [env.FORMS_NOTIFY_EMAIL],
      reply_to: input.email,
      subject: `New contact form message from ${input.name}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        page ? `Page: ${page}` : '',
        '',
        input.message,
      ]
        .filter((line) => line !== '')
        .join('\n'),
    }),
  })
  if (!response.ok)
    console.error('[forms] Resend notification failed', response.status, await response.text())
}
