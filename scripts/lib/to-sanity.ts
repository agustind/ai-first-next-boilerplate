/**
 * Domain content (features/cms/model shapes) → Sanity documents.
 *
 * Driven by the Studio schema itself (sanity/schemas), so a new section or
 * field is converted without touching this file. Pure: no network. Images are
 * resolved through `imageAsset(src)`, which returns an asset document id.
 */
import type { demoPages, demoPosts, demoRedirects, demoSettings } from '@/features/cms/demo/content'
import { schemaTypes } from '@/sanity/schemas'

type Json = Record<string, unknown>
// Studio field definitions, typed loosely: we only read name/type/of/fields.
type FieldDef = { name?: string; type: string; of?: FieldDef[]; fields?: FieldDef[] }
export type SanityDoc = Json & { _id: string; _type: string }

export type DemoContent = {
  settings: typeof demoSettings
  pages: typeof demoPages
  posts: typeof demoPosts
  redirects: typeof demoRedirects
}

export type ImageResolver = (src: string) => string

const namedTypes = new Map(
  (schemaTypes as unknown as (FieldDef & { name: string })[]).map((type) => [type.name, type]),
)

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')

/** Sanity keys: deterministic, unique within their array, [a-zA-Z0-9-]. */
const safeKey = (value: string) => value.replace(/[^a-zA-Z0-9-]/g, '-')

function keyed(items: unknown[], prefix: string) {
  const seen = new Set<string>()
  return items.map((item, index) => {
    const record = isObject(item) ? item : { value: item }
    let key = safeKey(String(record._key ?? record.key ?? `${prefix}-${index}`))
    while (seen.has(key)) key = `${key}-${index}`
    seen.add(key)
    return { record, key }
  })
}

/** Domain image `{ src, alt, … }` → Sanity image field. */
export function toImage(value: unknown, imageAsset: ImageResolver): Json | undefined {
  if (!isObject(value) || typeof value.src !== 'string') return undefined
  return {
    _type: 'image',
    asset: { _type: 'reference', _ref: imageAsset(value.src) },
    alt: typeof value.alt === 'string' ? value.alt : '',
    ...(isObject(value.hotspot)
      ? { hotspot: { _type: 'sanity.imageHotspot', ...value.hotspot } }
      : {}),
  }
}

/** Domain link `{ label, href }` → Sanity `link` object (external, relative paths allowed). */
export function toLink(value: Json, key?: string): Json {
  return {
    _type: 'link',
    ...(key ? { _key: key } : {}),
    label: value.label,
    linkType: 'external',
    url: value.href,
  }
}

/** Domain rich text → Portable Text blocks, every array item keyed. */
export function toBlocks(value: unknown, imageAsset: ImageResolver, prefix: string): Json[] {
  if (!isObject(value)) return []
  if (value.format === 'html') {
    const text = String(value.html ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text ? [block(text, `${prefix}-0`)] : []
  }
  const blocks = Array.isArray(value.blocks) ? value.blocks : []
  return keyed(blocks, prefix).map(({ record, key }) => {
    if (record._type === 'image') {
      const image = toImage(record.image, imageAsset)
      return { ...image, _key: key, ...(record.caption ? { caption: record.caption } : {}) }
    }
    const children = Array.isArray(record.children) ? record.children : []
    const markDefs = Array.isArray(record.markDefs) ? record.markDefs : []
    return {
      ...record,
      _type: record._type ?? 'block',
      _key: key,
      style: record.style ?? 'normal',
      markDefs: keyed(markDefs, `${key}-m`).map(({ record: def, key: defKey }) =>
        def._type === 'link'
          ? {
              _key: String(def._key ?? defKey),
              _type: 'link',
              label: '',
              linkType: 'external',
              url: def.href,
            }
          : { ...def, _key: String(def._key ?? defKey) },
      ),
      children: keyed(children, `${key}-s`).map(({ record: child, key: childKey }) => ({
        _type: 'span',
        marks: [],
        ...child,
        _key: childKey,
      })),
    }
  })
}

function block(text: string, key: string): Json {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}-s`, text, marks: [] }],
  }
}

function resolveFields(def: FieldDef): FieldDef[] {
  if (def.fields) return def.fields
  return namedTypes.get(def.type)?.fields ?? []
}

/** Convert one value according to its Studio field definition. */
function convertValue(
  value: unknown,
  def: FieldDef,
  imageAsset: ImageResolver,
  path: string,
): unknown {
  if (value === undefined || value === null) return undefined
  if (def.type === 'image') return toImage(value, imageAsset)
  if (def.type === 'link') return isObject(value) ? toLink(value) : undefined

  if (def.type === 'array') {
    const members = def.of ?? []
    if (members.some((member) => member.type === 'block')) return toBlocks(value, imageAsset, path)
    if (!Array.isArray(value)) return undefined
    return keyed(value, path).map(({ record, key }) => {
      const member = members.find((m) => m.name === record._type) ?? members[0]
      if (!member) return { ...record, _key: key }
      if (member.type === 'link') return toLink(record, key)
      if (member.type === 'reference') return { ...record, _key: key }
      const fields = resolveFields(member)
      return {
        _type: member.name ?? member.type,
        _key: key,
        ...convertFields(record, fields, imageAsset, `${path}-${key}`),
      }
    })
  }

  const fields = def.type === 'object' || namedTypes.has(def.type) ? resolveFields(def) : []
  if (fields.length > 0 && isObject(value)) {
    const converted = convertFields(value, fields, imageAsset, path)
    return def.type === 'object' ? converted : { _type: def.type, ...converted }
  }
  return value
}

/** Keep only fields the schema declares, converting each by its type. */
export function convertFields(
  source: Json,
  fields: FieldDef[],
  imageAsset: ImageResolver,
  path: string,
) {
  const out: Json = {}
  for (const field of fields) {
    if (!field.name) continue
    const converted = convertValue(source[field.name], field, imageAsset, `${path}-${field.name}`)
    if (converted !== undefined) out[field.name] = converted
  }
  return out
}

/** A page-builder section (`{ type, key, ...fields }`) → Sanity array member. */
export function toSection(section: Json, imageAsset: ImageResolver): Json {
  const type = String(section.type)
  const schema = namedTypes.get(type)
  if (!schema) throw new Error(`No Sanity schema for section type "${type}"`)
  const key = safeKey(String(section.key ?? type))
  return {
    _type: type,
    _key: key,
    ...convertFields(section, resolveFields(schema), imageAsset, key),
  }
}

function toDocument(type: string, id: string, source: Json, imageAsset: ImageResolver): SanityDoc {
  const schema = namedTypes.get(type)
  if (!schema) throw new Error(`No Sanity schema for document type "${type}"`)
  return { _id: id, _type: type, ...convertFields(source, resolveFields(schema), imageAsset, type) }
}

const slug = (current: string) => ({ _type: 'slug', current })
const ref = (id: string, key?: string) => ({
  _type: 'reference',
  _ref: id,
  ...(key ? { _key: key } : {}),
})

export const pageId = (uri: string) =>
  uri === '/' ? 'page-home' : `page-${slugify(uri.replace(/^\/+/, '').replaceAll('/', '-'))}`

/** Every image `src` referenced anywhere in the content (to upload before converting). */
export function collectImageSources(content: unknown): string[] {
  const found = new Set<string>()
  const walk = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(walk)
    if (!isObject(value)) return
    if (typeof value.src === 'string' && typeof value.width === 'number') found.add(value.src)
    Object.values(value).forEach(walk)
  }
  walk(content)
  return [...found]
}

/** Convert the whole demo content set into Sanity documents (deterministic ids). */
export function demoToSanityDocuments(
  content: DemoContent,
  imageAsset: ImageResolver,
): SanityDoc[] {
  const { settings, pages, posts, redirects } = content
  const docs: SanityDoc[] = []

  docs.push(
    toDocument(
      'settings',
      'siteSettings',
      {
        siteName: settings.siteName,
        description: settings.description,
        navigation: settings.navigation,
        footerText: settings.footer.text,
        footerLinks: settings.footer.links,
        social: settings.social,
      },
      imageAsset,
    ),
  )

  for (const page of pages) {
    const doc = toDocument(
      'page',
      pageId(page.uri),
      { title: page.title, seo: page.seo },
      imageAsset,
    )
    doc.slug = slug(page.uri === '/' ? 'index' : page.uri.replace(/^\//, ''))
    doc.sections = page.sections.map((section) => toSection(section as Json, imageAsset))
    docs.push(doc)
  }

  const authors = new Map<string, SanityDoc>()
  const categories = new Map<string, SanityDoc>()
  for (const post of posts) {
    const author = post.author
    if (author && !authors.has(author.name)) {
      authors.set(
        author.name,
        toDocument('author', `author-${slugify(author.name)}`, author, imageAsset),
      )
    }
    for (const category of post.categories) {
      if (!categories.has(category.slug)) {
        const doc = toDocument(
          'category',
          `category-${category.slug}`,
          { title: category.title },
          imageAsset,
        )
        doc.slug = slug(category.slug)
        categories.set(category.slug, doc)
      }
    }
  }
  docs.push(...authors.values(), ...categories.values())

  for (const post of posts) {
    const doc = toDocument(
      'post',
      `post-${post.slug}`,
      {
        title: post.title,
        excerpt: post.excerpt,
        mainImage: post.image,
        publishedAt: post.publishedAt,
        body: post.body,
        seo: post.seo,
      },
      imageAsset,
    )
    doc.slug = slug(post.slug)
    if (post.author) doc.author = ref(`author-${slugify(post.author.name)}`)
    doc.categories = post.categories.map((category) =>
      ref(`category-${category.slug}`, category.slug),
    )
    docs.push(doc)
  }

  redirects.forEach((redirect) => {
    docs.push(
      toDocument(
        'redirect',
        `redirect-${slugify(redirect.source) || 'root'}`,
        redirect,
        imageAsset,
      ),
    )
  })

  return docs
}

/**
 * Structural checks against the Studio schema: unknown fields and array items
 * without `_key`. Returns human-readable problems (empty when valid).
 */
export function validateDocument(doc: Json): string[] {
  const problems: string[] = []
  const schema = namedTypes.get(String(doc._type))
  if (!schema) return [`${String(doc._id)}: unknown type ${String(doc._type)}`]

  const fieldsOf = (def: FieldDef | undefined, value: Json) =>
    def?.fields ??
    (def ? namedTypes.get(def.type)?.fields : undefined) ??
    namedTypes.get(String(value._type))?.fields

  const check = (value: unknown, def: FieldDef | undefined, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (!isObject(item)) return
        if (typeof item._key !== 'string') problems.push(`${path}[${index}] has no _key`)
        const members = def?.of ?? []
        const member =
          members.find((m) => m.name === item._type || m.type === item._type) ??
          (members.length === 1 ? members[0] : undefined)
        // Portable Text blocks are validated by Sanity itself; only keys matter here.
        if (member?.type === 'block') return
        check(item, member, `${path}[${index}]`)
      })
      return
    }
    if (!isObject(value)) return
    if (def?.type === 'reference' || def?.type === 'slug' || value._type === 'reference') return
    const fields = fieldsOf(def, value)
    if (!fields) return
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith('_') || ['asset', 'hotspot', 'crop'].includes(key)) continue
      const field = fields.find((f) => f.name === key)
      if (!field) {
        problems.push(`${path}.${key} is not in the schema`)
        continue
      }
      check(child, field, `${path}.${key}`)
    }
  }

  check(doc, schema, String(doc._id))
  return problems
}
