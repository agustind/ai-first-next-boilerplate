import 'server-only'
import { createClient, type SanityClient } from 'next-sanity'
import { env } from '@/env'
import { apiVersion, dataset, projectId, studioUrl } from './config'

let readClient: SanityClient | undefined
let writeClient: SanityClient | undefined

/** Lazily created so importing this module never throws when Sanity isn't configured. */
export function getSanityClient() {
  readClient ??= createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: 'published',
    stega: { studioUrl },
  })
  return readClient
}

/** Editor-token client for mutations (form submissions, seeding). Server only. */
export function getSanityWriteClient() {
  if (!env.SANITY_API_WRITE_TOKEN) return null
  writeClient ??= getSanityClient().withConfig({
    token: env.SANITY_API_WRITE_TOKEN,
    useCdn: false,
    stega: false,
  })
  return writeClient
}
