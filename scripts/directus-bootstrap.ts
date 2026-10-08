// biome-ignore-all lint/suspicious/noConsole: CLI script, console is its UI
/**
 * Create the Directus schema from code (features/cms/directus/*): collections,
 * fields, relations, the page-builder many-to-any, and read permissions.
 *
 *   DIRECTUS_URL=http://localhost:8055 DIRECTUS_ADMIN_TOKEN=… npm run directus:bootstrap
 *   (or DIRECTUS_ADMIN_EMAIL + DIRECTUS_ADMIN_PASSWORD instead of the token)
 *   npm run directus:bootstrap -- --dry-run      # print the plan, no network
 *
 * Idempotent: anything that already exists is skipped, never modified.
 */
import { existsSync } from 'node:fs'
import {
  authentication,
  createCollection,
  createDirectus,
  createField,
  createPermissions,
  createPolicy,
  createRelation,
  readCollections,
  readFields,
  readPermissions,
  readPolicies,
  readRelations,
  rest,
  staticToken,
} from '@directus/sdk'
import {
  type Operation,
  planSchema,
  publicReadCollections,
  websiteReadCollections,
} from './lib/directus-schema'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const dryRun = process.argv.includes('--dry-run')
const WEBSITE_POLICY = 'Website'

function fail(message: string): never {
  console.error(`✖ ${message}`)
  process.exit(1)
}

const describe = (op: Operation) =>
  op.kind === 'collection'
    ? `collection ${op.collection}`
    : `${op.kind} ${op.collection}.${op.field}`

// biome-ignore lint/suspicious/noExplicitAny: schema is created by this script, so there is no typed schema yet
type Client = ReturnType<typeof createDirectus<any>> & { request: (command: any) => Promise<any> }

async function connect(url: string): Promise<Client> {
  const token = process.env.DIRECTUS_ADMIN_TOKEN
  if (token) return createDirectus(url).with(staticToken(token)).with(rest()) as unknown as Client

  const email = process.env.DIRECTUS_ADMIN_EMAIL
  const password = process.env.DIRECTUS_ADMIN_PASSWORD
  if (!email || !password)
    fail('Set DIRECTUS_ADMIN_TOKEN, or DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD.')
  const client = createDirectus(url).with(authentication('json')).with(rest())
  await client.login({ email, password })
  return client as unknown as Client
}

async function applySchema(client: Client, plan: Operation[]) {
  const [collections, fields, relations] = (await Promise.all([
    client.request(readCollections()),
    client.request(readFields()),
    client.request(readRelations()),
  ])) as [
    { collection: string }[],
    { collection: string; field: string }[],
    { collection: string; field: string }[],
  ]

  const existing = {
    collection: new Set(collections.map((c) => c.collection)),
    field: new Set(fields.map((f) => `${f.collection}.${f.field}`)),
    relation: new Set(relations.map((r) => `${r.collection}.${r.field}`)),
  }

  let created = 0
  for (const op of plan) {
    const id = op.kind === 'collection' ? op.collection : `${op.collection}.${op.field}`
    if (existing[op.kind].has(id)) continue
    if (op.kind === 'collection') await client.request(createCollection(op.payload as never))
    if (op.kind === 'field')
      await client.request(createField(op.collection as never, op.payload as never))
    if (op.kind === 'relation') await client.request(createRelation(op.payload as never))
    existing[op.kind].add(id)
    created++
    console.log(`+ ${describe(op)}`)
  }
  return created
}

/** Public policy: Directus marks it with the translation key `$t:public_label`. */
async function findPublicPolicy(client: Client) {
  const policies = (await client.request(
    readPolicies({
      fields: ['id', 'name'],
      filter: { name: { _in: ['$t:public_label', 'Public'] } },
    }),
  )) as { id: string; name: string }[]
  return policies[0]?.id
}

async function ensureWebsitePolicy(client: Client) {
  const found = (await client.request(
    readPolicies({ fields: ['id'], filter: { name: { _eq: WEBSITE_POLICY } } }),
  )) as { id: string }[]
  if (found[0]) return found[0].id
  const policy = (await client.request(
    createPolicy({
      name: WEBSITE_POLICY,
      icon: 'public',
      description:
        'For the Next.js site token: read all content (drafts for preview), create form submissions.',
      admin_access: false,
      app_access: false,
    }),
  )) as { id: string }
  console.log(`+ policy ${WEBSITE_POLICY}`)
  return policy.id
}

type PermissionInput = {
  collection: string
  action: 'read' | 'create'
  permissions: Record<string, unknown>
}

async function grant(client: Client, policy: string, wanted: PermissionInput[]) {
  const current = (await client.request(
    readPermissions({
      fields: ['collection', 'action'],
      filter: { policy: { _eq: policy } },
      limit: -1,
    }),
  )) as { collection: string; action: string }[]
  const has = new Set(current.map((p) => `${p.collection}:${p.action}`))
  const missing = wanted.filter((p) => !has.has(`${p.collection}:${p.action}`))
  if (missing.length === 0) return 0
  await client.request(
    createPermissions(
      missing.map((p) => ({
        policy,
        collection: p.collection,
        action: p.action,
        fields: ['*'],
        permissions: p.permissions,
      })) as never,
    ),
  )
  for (const p of missing) console.log(`+ permission ${p.action} ${p.collection}`)
  return missing.length
}

function permissionPlan() {
  const published = { status: { _eq: 'published' } }
  return {
    public: publicReadCollections().map(({ collection, publishedOnly }) => ({
      collection,
      action: 'read' as const,
      permissions: publishedOnly ? published : {},
    })),
    website: [
      ...websiteReadCollections().map((collection) => ({
        collection,
        action: 'read' as const,
        permissions: {},
      })),
      { collection: 'form_submissions', action: 'create' as const, permissions: {} },
    ],
  }
}

async function main() {
  const plan = planSchema()
  const permissions = permissionPlan()

  if (dryRun) {
    for (const op of plan) console.log(`${describe(op).padEnd(52)} ${JSON.stringify(op.payload)}`)
    console.log(`\nPublic policy reads: ${permissions.public.map((p) => p.collection).join(', ')}`)
    console.log(
      `Website policy: ${permissions.website.map((p) => `${p.action} ${p.collection}`).join(', ')}`,
    )
    const counts: Record<string, number> = {}
    for (const op of plan) counts[op.kind] = (counts[op.kind] ?? 0) + 1
    console.log(
      `\n${plan.length} schema operations (${JSON.stringify(counts)}). Dry run: nothing was sent.`,
    )
    return
  }

  const url = process.env.DIRECTUS_URL
  if (!url) fail('DIRECTUS_URL is not set (e.g. http://localhost:8055).')
  const client = await connect(url)

  const created = await applySchema(client, plan)

  const publicPolicy = await findPublicPolicy(client)
  let granted = 0
  if (publicPolicy) granted += await grant(client, publicPolicy, permissions.public)
  else
    console.warn(
      '! Public policy not found: grant read access to content and directus_files manually.',
    )
  granted += await grant(client, await ensureWebsitePolicy(client), permissions.website)

  console.log(
    `\n✓ Directus schema ready: ${created} created, ${plan.length - created} already existed, ${granted} permissions granted.`,
  )
  console.log(
    'Next: create a user with the "Website" policy, generate a static token, set DIRECTUS_TOKEN (see directus/README.md).',
  )
}

main().catch((error: unknown) => {
  const errors = (error as { errors?: { message: string }[] })?.errors
  fail(
    errors?.map((e) => e.message).join('; ') ??
      (error instanceof Error ? error.message : String(error)),
  )
})
