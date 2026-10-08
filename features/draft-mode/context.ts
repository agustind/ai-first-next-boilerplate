import 'server-only'
import { cookies, draftMode } from 'next/headers'
import { resolvePerspectiveFromCookies, resolveVariantFromCookies } from 'next-sanity/live'
import { resolveCmsProvider } from '@/env'
import { type FetchContext, PUBLISHED } from '@/features/cms'

export async function isDraftMode() {
  return (await draftMode()).isEnabled
}

/**
 * Fetch context for the current request. Reads runtime data (draft mode,
 * cookies), so call it OUTSIDE `'use cache'` and pass the result down.
 * Published requests get `PUBLISHED` and stay fully static.
 */
export async function getFetchContext(): Promise<FetchContext> {
  if (!(await isDraftMode())) return PUBLISHED
  if (resolveCmsProvider() !== 'sanity') return { draft: true, perspective: 'drafts', stega: false }

  // Sanity Presentation tool stores the selected perspective/release in cookies.
  const jar = await cookies()
  const perspective = await resolvePerspectiveFromCookies({ cookies: jar })
  const variant = await resolveVariantFromCookies({ cookies: jar })
  return { draft: true, perspective: perspective ?? 'drafts', variant, stega: true }
}
