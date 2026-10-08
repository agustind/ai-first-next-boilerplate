import type { Route } from 'next'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { env, resolveCmsProvider } from '@/env'
import { getSanityClient } from '@/features/cms/sanity/client'

/**
 * Sanity: the Presentation tool calls this with a signed secret.
 * Other CMSs: /api/draft-mode/enable?secret=REVALIDATE_SECRET&redirect=/path
 */
export async function GET(request: Request) {
  if (resolveCmsProvider() === 'sanity') {
    const { GET: enable } = defineEnableDraftMode({
      client: getSanityClient().withConfig({ token: env.SANITY_API_READ_TOKEN }),
    })
    return enable(request)
  }

  const url = new URL(request.url)
  if (!env.REVALIDATE_SECRET || url.searchParams.get('secret') !== env.REVALIDATE_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }
  ;(await draftMode()).enable()
  const target = url.searchParams.get('redirect') ?? '/'
  redirect((target.startsWith('/') && !target.startsWith('//') ? target : '/') as Route)
}
