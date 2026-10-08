// biome-ignore-all lint/suspicious/noConsole: CLI script, console is its UI
/**
 * Seed a Sanity dataset with the demo content, so a new project starts with
 * real, editable documents instead of an empty Studio.
 *
 *   npm run sanity:seed            # upload images + createOrReplace all docs
 *   npm run sanity:seed -- --dry-run   # print the documents, no network
 *
 * Idempotent: deterministic _ids + createOrReplace, so re-running resets the
 * demo documents (and leaves everything else alone).
 */
import { existsSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { createClient } from '@sanity/client'
import { demoPages, demoPosts, demoRedirects, demoSettings } from '@/features/cms/demo/content'
import { collectImageSources, demoToSanityDocuments, validateDocument } from './lib/to-sanity'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const dryRun = process.argv.includes('--dry-run')
const content = {
  settings: demoSettings,
  pages: demoPages,
  posts: demoPosts,
  redirects: demoRedirects,
}

function fail(message: string): never {
  console.error(`✖ ${message}`)
  process.exit(1)
}

async function main() {
  const sources = collectImageSources(content)

  if (dryRun) {
    const documents = demoToSanityDocuments(content, (src) => `image-dryrun-${basename(src)}`)
    const problems = documents.flatMap(validateDocument)
    console.log(JSON.stringify(documents, null, 2))
    console.error(`\n${documents.length} documents, ${sources.length} images (not uploaded).`)
    if (problems.length > 0) fail(`Schema problems:\n  ${problems.join('\n  ')}`)
    console.error('✓ All documents match the Studio schema.')
    return
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const token = process.env.SANITY_API_WRITE_TOKEN
  if (!projectId)
    fail('NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Run `npx sanity@latest init --env .env.local`.')
  if (!token)
    fail(
      'SANITY_API_WRITE_TOKEN is not set. Create an Editor token at https://www.sanity.io/manage.',
    )

  const client = createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-10-01',
    token,
    useCdn: false,
  })

  const assetIds = new Map<string, string>()
  for (const src of sources) {
    if (/^https?:\/\//.test(src)) fail(`Remote image ${src} — seed only supports files in public/`)
    const file = join('public', src)
    if (!existsSync(file)) fail(`Image ${src} not found at ${file}`)
    const asset = await client.assets.upload('image', readFileSync(file), {
      filename: basename(file),
    })
    assetIds.set(src, asset._id)
    console.log(`↑ ${src} → ${asset._id}`)
  }

  const documents = demoToSanityDocuments(content, (src) => {
    const id = assetIds.get(src)
    if (!id) throw new Error(`Image ${src} was not uploaded`)
    return id
  })
  const problems = documents.flatMap(validateDocument)
  if (problems.length > 0) fail(`Schema problems:\n  ${problems.join('\n  ')}`)

  const transaction = client.transaction()
  for (const document of documents) transaction.createOrReplace(document)
  await transaction.commit()

  console.log(
    `✓ Seeded ${documents.length} documents into ${projectId}/${client.config().dataset}.`,
  )
}

main().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)))
