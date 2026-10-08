import 'server-only'
import type { QueryParams } from 'next-sanity'
import { defineLive, type LivePerspective } from 'next-sanity/live'
import { env } from '@/env'
import { getSanityClient } from './client'

let live: ReturnType<typeof createLive> | undefined

function createLive() {
  return defineLive({
    client: getSanityClient(),
    serverToken: env.SANITY_API_READ_TOKEN,
    browserToken: env.SANITY_API_READ_TOKEN,
    strict: true,
  })
}

export function getLive() {
  live ??= createLive()
  return live
}

export type SanityFetchOptions = {
  query: string
  params?: QueryParams
  perspective: LivePerspective
  stega: boolean
  variant?: string
}

/**
 * The app's single `'use cache'` boundary for Sanity. `sanityFetch` adds the
 * cache tags and cacheLife; `<SanityLive>` expires tags when content changes,
 * so published pages are static yet always fresh. Dynamic inputs (draft mode,
 * cookies) are resolved by the caller and passed in.
 */
export async function cachedSanityFetch(options: SanityFetchOptions): Promise<unknown> {
  'use cache'
  const { data } = await getLive().sanityFetch({ ...options, stega: options.stega as boolean })
  return data
}
