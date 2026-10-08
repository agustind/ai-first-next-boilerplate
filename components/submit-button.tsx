'use client'

import type { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from './button'

/** Disables itself and announces progress while its parent form is submitting. */
export function SubmitButton({
  children,
  pendingLabel = 'Sending…',
  ...props
}: ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} aria-disabled={pending} {...props}>
      <span aria-live="polite">{pending ? pendingLabel : children}</span>
    </Button>
  )
}
