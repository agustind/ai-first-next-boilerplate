import type { DirectusFieldSpec, DirectusSectionSpec } from './spec'

type Row = Record<string, unknown>
export type DirectusFile = {
  id: string
  width?: number | null
  height?: number | null
  description?: string | null
}

export const FILE_FIELDS = ['id', 'width', 'height', 'description']

export function assetUrl(baseUrl: string, id: string) {
  return `${baseUrl.replace(/\/$/, '')}/assets/${id}`
}

export function mapImage(baseUrl: string, file: unknown) {
  if (!file || typeof file !== 'object') return null
  const { id, width, height, description } = file as DirectusFile
  if (!id || !width || !height) return null
  return { src: assetUrl(baseUrl, id), alt: description ?? '', width, height }
}

export function mapRichText(value: unknown) {
  return { format: 'html' as const, html: typeof value === 'string' ? value : '' }
}

function mapField(baseUrl: string, spec: DirectusFieldSpec, value: unknown): unknown {
  switch (spec.kind) {
    case 'image':
      return mapImage(baseUrl, value)
    case 'richText':
      return mapRichText(value)
    case 'links':
    case 'json':
      return Array.isArray(value) ? value : (value ?? null)
    case 'repeater':
      return Array.isArray(value)
        ? value.map((row) => mapFields(baseUrl, spec.fields, row as Row))
        : []
    default:
      return value ?? null
  }
}

export function mapFields(baseUrl: string, fields: DirectusFieldSpec[], row: Row) {
  return Object.fromEntries(
    fields.map((spec) => [spec.field, mapField(baseUrl, spec, row[spec.field])]),
  )
}

/** Directus field selection for a spec: files are expanded to their metadata. */
export function fieldsQuery(fields: DirectusFieldSpec[]): (string | Record<string, string[]>)[] {
  return [
    'id',
    ...fields.map((spec) => (spec.kind === 'image' ? { [spec.field]: FILE_FIELDS } : spec.field)),
  ]
}

/** Many-to-any junction rows (`pages_sections`) → raw section objects for the content model. */
export function mapSections(baseUrl: string, specs: DirectusSectionSpec[], rows: unknown) {
  if (!Array.isArray(rows)) return []
  const byCollection = new Map(specs.map((spec) => [spec.collection, spec]))
  return rows.flatMap((row: Row) => {
    const spec = byCollection.get(String(row.collection))
    const item = row.item as Row | null
    if (!spec || !item) return []
    return [
      {
        type: spec.type,
        key: `${spec.collection}-${String(item.id ?? row.id)}`,
        anchor: item.anchor ?? null,
        tone: item.tone ?? null,
        ...mapFields(baseUrl, spec.fields, item),
      },
    ]
  })
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
