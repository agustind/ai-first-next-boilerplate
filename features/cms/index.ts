import 'server-only'
import { resolveCmsProvider } from '@/env'
import { demoSource } from './demo/adapter'
import { directusSource } from './directus/adapter'
import { sanitySource } from './sanity/adapter'
import type { ContentSource } from './source'

export { type ContentSource, type FetchContext, PUBLISHED } from './source'

const sources = { sanity: sanitySource, directus: directusSource, demo: demoSource } as const

/** The active CMS adapter. Chosen by CMS_PROVIDER or inferred from credentials (see env.ts). */
export function getContentSource(): ContentSource {
  return sources[resolveCmsProvider()]
}
