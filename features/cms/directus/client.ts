import 'server-only'
import {
  createDirectus,
  type RestClient,
  rest,
  type StaticTokenClient,
  staticToken,
} from '@directus/sdk'
import { env } from '@/env'

// biome-ignore lint/suspicious/noExplicitAny: content is validated by the zod model, not the SDK schema
type Schema = any
let client:
  | (ReturnType<typeof createDirectus<Schema>> & RestClient<Schema> & StaticTokenClient<Schema>)
  | undefined

export function getDirectusUrl() {
  if (!env.DIRECTUS_URL) throw new Error('DIRECTUS_URL is not set')
  return env.DIRECTUS_URL
}

export function getDirectusClient() {
  client ??= createDirectus<Schema>(getDirectusUrl())
    .with(staticToken(env.DIRECTUS_TOKEN ?? ''))
    // No fetch cache options: published reads are cached by the adapter's 'use cache'
    // scope (tagged `directus`), drafts are uncached by default under Cache Components.
    .with(rest())
  return client
}
