import 'server-only'
import { createItem, readItems, readSingleton } from '@directus/sdk'
import { cacheTag } from 'next/cache'
import { toPage, toPost, toPostSummaries, toRedirects, toRoutes, toSettings } from '../parse'
import { type ContentSource, type FetchContext, PUBLISHED } from '../source'
import { getDirectusClient, getDirectusUrl } from './client'
import { FILE_FIELDS, fieldsQuery, mapImage, mapRichText, mapSections, slugify } from './mapper'
import { directusSections } from './sections'

type Row = Record<string, unknown>
type Query = Record<string, unknown>

/** Every Directus read is tagged; POST /api/revalidate (a Directus Flow) expires `directus`. */
export const DIRECTUS_TAG = 'directus'

async function cachedRead(kind: 'items' | 'singleton', collection: string, query: Query) {
  'use cache'
  cacheTag(DIRECTUS_TAG, `${DIRECTUS_TAG}:${collection}`)
  return read(kind, collection, query)
}

function read(kind: 'items' | 'singleton', collection: string, query: Query): Promise<unknown> {
  const client = getDirectusClient()
  return kind === 'items'
    ? client.request(readItems(collection, query as never))
    : client.request(readSingleton(collection, query as never))
}

/** Draft mode skips the cache and the published filter. */
function fetchWith(
  ctx: FetchContext,
  kind: 'items' | 'singleton',
  collection: string,
  query: Query,
) {
  return ctx.draft ? read(kind, collection, query) : cachedRead(kind, collection, query)
}

const published = (ctx: FetchContext) => (ctx.draft ? {} : { status: { _eq: 'published' } })

const SEO_FIELDS = ['seo_title', 'seo_description', 'seo_no_index', { seo_image: FILE_FIELDS }]

function mapSeo(base: string, row: Row) {
  return {
    title: row.seo_title,
    description: row.seo_description,
    noIndex: row.seo_no_index,
    image: mapImage(base, row.seo_image),
  }
}

const SECTION_FIELDS = {
  sections: [
    'id',
    'collection',
    {
      item: Object.fromEntries(
        directusSections.map((spec) => [
          spec.collection,
          [...fieldsQuery(spec.fields), 'anchor', 'tone'],
        ]),
      ),
    },
  ],
}

const POST_SUMMARY_FIELDS = [
  'id',
  'title',
  'slug',
  'excerpt',
  'published_at',
  'date_created',
  'date_updated',
  'tags',
  { image: FILE_FIELDS },
  { author: ['name', 'role', { image: FILE_FIELDS }] },
]

function mapPostSummary(base: string, row: Row) {
  const author = row.author as Row | null
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    image: mapImage(base, row.image),
    publishedAt: row.published_at ?? row.date_created,
    updatedAt: row.date_updated ?? row.date_created,
    author: author
      ? { name: author.name, role: author.role, image: mapImage(base, author.image) }
      : null,
    categories: (Array.isArray(row.tags) ? row.tags : []).map((tag) => ({
      title: String(tag),
      slug: slugify(String(tag)),
    })),
  }
}

const first = (rows: unknown) => (Array.isArray(rows) ? (rows[0] as Row | undefined) : undefined)

export const directusSource: ContentSource = {
  provider: 'directus',
  async getSettings(ctx = PUBLISHED) {
    const base = getDirectusUrl()
    const row = (await fetchWith(ctx, 'singleton', 'settings', {
      fields: ['*', { og_image: FILE_FIELDS }],
    }).catch(() => null)) as Row | null
    if (!row) return toSettings(null)
    return toSettings({
      siteName: row.site_name,
      description: row.description ?? '',
      navigation: row.navigation,
      footer: { text: row.footer_text, links: row.footer_links },
      social: row.social,
      ogImage: mapImage(base, row.og_image),
    })
  },
  async getPage(uri, ctx = PUBLISHED) {
    const base = getDirectusUrl()
    const row = first(
      await fetchWith(ctx, 'items', 'pages', {
        filter: { uri: { _eq: uri }, ...published(ctx) },
        fields: [
          'id',
          'title',
          'uri',
          'date_updated',
          'date_created',
          ...SEO_FIELDS,
          SECTION_FIELDS,
        ],
        deep: { sections: { _sort: ['sort'] } },
        limit: 1,
      }),
    )
    if (!row) return null
    return toPage({
      id: String(row.id),
      title: row.title,
      uri: row.uri,
      seo: mapSeo(base, row),
      sections: mapSections(base, directusSections, row.sections),
      updatedAt: row.date_updated ?? row.date_created,
    })
  },
  async getPost(slug, ctx = PUBLISHED) {
    const base = getDirectusUrl()
    const row = first(
      await fetchWith(ctx, 'items', 'posts', {
        filter: { slug: { _eq: slug }, ...published(ctx) },
        fields: [...POST_SUMMARY_FIELDS, 'body', ...SEO_FIELDS],
        limit: 1,
      }),
    )
    if (!row) return null
    return toPost({
      ...mapPostSummary(base, row),
      body: mapRichText(row.body),
      seo: mapSeo(base, row),
    })
  },
  async listPosts(ctx = PUBLISHED, { limit = 100 } = {}) {
    const base = getDirectusUrl()
    const rows = (await fetchWith(ctx, 'items', 'posts', {
      filter: published(ctx),
      fields: POST_SUMMARY_FIELDS,
      sort: ['-published_at'],
      limit,
    })) as Row[]
    return toPostSummaries(rows.map((row) => mapPostSummary(base, row)))
  },
  async listRoutes() {
    const [pages, posts] = (await Promise.all([
      cachedRead('items', 'pages', {
        filter: { status: { _eq: 'published' } },
        fields: ['uri', 'title', 'date_updated', 'date_created', 'seo_no_index'],
        limit: -1,
      }),
      cachedRead('items', 'posts', {
        filter: { status: { _eq: 'published' } },
        fields: ['slug', 'title', 'date_updated', 'date_created', 'seo_no_index'],
        limit: -1,
      }),
    ])) as [Row[], Row[]]
    return toRoutes([
      ...pages.map((row) => ({
        uri: row.uri,
        title: row.title,
        type: 'page',
        updatedAt: row.date_updated ?? row.date_created,
        noIndex: row.seo_no_index,
      })),
      ...posts.map((row) => ({
        uri: `/blog/${String(row.slug)}`,
        title: row.title,
        type: 'post',
        updatedAt: row.date_updated ?? row.date_created,
        noIndex: row.seo_no_index,
      })),
    ])
  },
  async listRedirects() {
    return toRedirects(
      await cachedRead('items', 'redirects', {
        fields: ['source', 'destination', 'permanent'],
        limit: -1,
      }),
    )
  },
  async submitForm(submission) {
    await getDirectusClient().request(
      createItem('form_submissions', {
        form: submission.form,
        page: submission.page,
        submitted_at: submission.submittedAt,
        data: submission.data,
      }),
    )
  },
}
