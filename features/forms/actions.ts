'use server'

import { headers } from 'next/headers'
import { type ContactInput, type FormState, HONEYPOT_FIELD, STARTED_AT_FIELD } from './contact'
import { submitContact } from './submit'

const SUCCESS = 'Thanks! Your message is on its way. We will get back to you soon.'

export async function submitContactForm(_prev: FormState, formData: FormData): Promise<FormState> {
  const values: Partial<ContactInput> = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
  }
  const headerList = await headers()

  const result = await submitContact(values, {
    channel: 'form',
    honeypot: formData.get(HONEYPOT_FIELD),
    startedAt: formData.get(STARTED_AT_FIELD),
    turnstileToken: formData.get('cf-turnstile-response'),
    ip: headerList.get('x-forwarded-for')?.split(',')[0]?.trim(),
    page: String(formData.get('page') ?? '') || undefined,
  })

  if (result.ok) return { status: 'success', message: SUCCESS }
  // Spam gets the same success message so bots learn nothing.
  if (result.kind === 'spam') return { status: 'success', message: SUCCESS }
  if (result.kind === 'invalid') {
    return {
      status: 'error',
      message: 'Please check the highlighted fields.',
      fieldErrors: result.fieldErrors,
      values,
    }
  }
  return { status: 'error', message: 'Something went wrong. Please try again in a moment.', values }
}
