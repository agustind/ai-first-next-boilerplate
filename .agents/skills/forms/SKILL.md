---
name: forms
description: Forms pipeline (validation, spam prevention, storage, email, JSON API). Use when adding a form, adding fields, or touching features/forms.
---

# Forms

One pipeline for every submission: **validate (Zod) → spam checks → store in the CMS → optional email**.

- Contract: `features/forms/contact.ts` (`contactInputSchema`, `FormState`). The same schema powers the server action, the JSON API and `/openapi.json`.
- Pipeline: `features/forms/submit.ts` → `submitContact(raw, { channel })`. `channel: 'form'` (browser) runs honeypot + timing + Turnstile; `'api'` (agents/integrations) skips browser-only checks but keeps content checks and the route's rate limit.
- Spam: `features/forms/spam.ts` — honeypot field, minimum fill time (set after mount), link stuffing, optional Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`). Spam gets a fake success response.
- Storage: `getContentSource().submitForm()` → Sanity `formSubmission` docs (needs `SANITY_API_WRITE_TOKEN`), Directus `form_submissions`, demo logs only. Email via Resend REST (`features/forms/notify.ts`) when `RESEND_API_KEY` + `FORMS_NOTIFY_EMAIL` are set. In production Sanity without a write token *and* without email, submissions throw rather than vanish.
- UI: `features/forms/contact-form.tsx` (`useActionState`, field errors with `aria-invalid`/`aria-describedby`, values preserved on error), `components/submit-button.tsx` (`useFormStatus`).
- API: `POST /api/forms/contact` (JSON). Rate limit in `features/forms/rate-limit.ts` is per-instance; use a shared store for real limits.

## Add a new form (e.g. newsletter)

1. `features/forms/newsletter.ts`: Zod schema + types.
2. Generalise `submitContact` into a `submitForm(formName, schema, raw, options)` or add a sibling; store with `form: 'newsletter'`.
3. Server action in `actions.ts`, client component mirroring `contact-form.tsx`.
4. If it should be placeable by editors, wrap it in a section (`add-section` skill).
5. If agents may submit it, add `app/api/forms/<name>/route.ts` and document it in `features/agents/openapi.ts`.
6. Tests for validation and spam rules (`*.test.ts` next to the code).

## Rules

- Never trust client values: everything is re-validated on the server.
- Never log full submissions in production (PII); log ids/emails only when needed for debugging.
- Keep accessible labels; errors must be announced (`role="alert"`) and linked to fields.
