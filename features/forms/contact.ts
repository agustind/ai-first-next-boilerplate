import { z } from 'zod'

/** The contact form contract, shared by the server action, the JSON API and OpenAPI docs. */
export const contactInputSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(120),
  email: z.email('Please enter a valid email address').max(254),
  message: z
    .string()
    .trim()
    .min(10, 'Please write at least 10 characters')
    .max(5000, 'Please keep it under 5000 characters'),
})
export type ContactInput = z.infer<typeof contactInputSchema>

export type FieldErrors = Partial<Record<keyof ContactInput, string[]>>

export type FormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors?: FieldErrors; values?: Partial<ContactInput> }

export const initialFormState: FormState = { status: 'idle' }

/** Hidden fields used for spam checks. */
export const HONEYPOT_FIELD = 'company_website'
export const STARTED_AT_FIELD = 'started_at'
