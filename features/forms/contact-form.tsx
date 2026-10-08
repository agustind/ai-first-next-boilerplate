'use client'

import { useActionState, useEffect, useId, useState } from 'react'
import { SubmitButton } from '@/components/submit-button'
import { cn } from '@/features/style/cn'
import { submitContactForm } from './actions'
import { type ContactInput, HONEYPOT_FIELD, initialFormState, STARTED_AT_FIELD } from './contact'
import { Turnstile } from './turnstile'

const inputClasses =
  'w-full rounded-xl border border-border bg-bg px-4 py-3 text-base outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-accent aria-invalid:border-danger'

export function ContactForm({
  page,
  turnstileSiteKey,
}: {
  page?: string
  turnstileSiteKey?: string
}) {
  const [state, formAction] = useActionState(submitContactForm, initialFormState)
  // Set after mount (never during SSR), checked server-side: humans take > 2.5s.
  const [startedAt, setStartedAt] = useState('')
  useEffect(() => setStartedAt(String(Date.now())), [])
  const id = useId()

  if (state.status === 'success') {
    return (
      <p role="status" className="rounded-card border border-border p-6 text-lg">
        {state.message}
      </p>
    )
  }

  const errors = state.status === 'error' ? state.fieldErrors : undefined
  const values = state.status === 'error' ? state.values : undefined

  const field = (name: keyof ContactInput, label: string, input: React.ReactNode) => (
    <div className="grid gap-2">
      <label htmlFor={`${id}-${name}`} className="font-medium text-sm">
        {label}
      </label>
      {input}
      {errors?.[name]?.[0] ? (
        <p id={`${id}-${name}-error`} className="text-danger text-sm">
          {errors[name]?.[0]}
        </p>
      ) : null}
    </div>
  )

  const a11y = (name: keyof ContactInput) => ({
    id: `${id}-${name}`,
    name,
    'aria-invalid': errors?.[name] ? true : undefined,
    'aria-describedby': errors?.[name] ? `${id}-${name}-error` : undefined,
  })

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {field(
        'name',
        'Name',
        <input
          {...a11y('name')}
          autoComplete="name"
          required
          defaultValue={values?.name}
          className={inputClasses}
        />,
      )}
      {field(
        'email',
        'Email',
        <input
          {...a11y('email')}
          type="email"
          autoComplete="email"
          required
          defaultValue={values?.email}
          className={inputClasses}
        />,
      )}
      {field(
        'message',
        'Message',
        <textarea
          {...a11y('message')}
          rows={5}
          required
          defaultValue={values?.message}
          className={cn(inputClasses, 'resize-y')}
        />,
      )}

      {/* Spam traps: hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name={STARTED_AT_FIELD} value={startedAt} />
      {page ? <input type="hidden" name="page" value={page} /> : null}

      <Turnstile siteKey={turnstileSiteKey} />

      {state.status === 'error' ? (
        <p role="alert" className="text-danger">
          {state.message}
        </p>
      ) : null}
      <div>
        <SubmitButton size="lg">Send message</SubmitButton>
      </div>
    </form>
  )
}
