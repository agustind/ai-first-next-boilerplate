import 'server-only'
import type { Route } from 'next'
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import { getContentSource } from '@/features/cms'
import { matchRedirect } from './match'

/**
 * Called by routes when content is missing: honour a CMS redirect if one
 * matches, otherwise 404. Redirects are only looked up on misses, so they
 * cost nothing on normal page views.
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const match = matchRedirect(path, await getContentSource().listRedirects())
  if (match) {
    if (match.permanent) permanentRedirect(match.destination as Route)
    redirect(match.destination as Route)
  }
  notFound()
}
