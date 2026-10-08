/**
 * Directus schema-as-code. Each section declares its fields once; the same spec
 * drives `npm run directus:bootstrap` (creates collections/fields) and the
 * generic mapper that turns Directus items into the content model.
 */
export type DirectusFieldSpec =
  | { field: string; kind: 'string' | 'text' | 'boolean'; required?: boolean; note?: string }
  | { field: string; kind: 'select'; choices: readonly string[]; default: string; note?: string }
  | { field: string; kind: 'image'; required?: boolean; note?: string }
  | { field: string; kind: 'richText'; note?: string }
  | { field: string; kind: 'links'; note?: string }
  | { field: string; kind: 'repeater'; fields: DirectusFieldSpec[]; note?: string }
  | { field: string; kind: 'datetime' | 'json' | 'tags'; required?: boolean; note?: string }
  | { field: string; kind: 'm2o'; related: string; note?: string }

export interface DirectusSectionSpec {
  type: string
  /** Directus collection name, `section_<name>`. */
  collection: string
  fields: DirectusFieldSpec[]
}

export function defineDirectusSection(spec: DirectusSectionSpec) {
  return spec
}

/** A non-section collection (pages, posts, settings…). */
export interface DirectusCollectionSpec {
  collection: string
  singleton?: boolean
  /** Adds a `status` field (published/draft) used to hide drafts outside draft mode. */
  status?: boolean
  /** Field shown as the item title in the Directus app. */
  displayTemplate?: string
  fields: DirectusFieldSpec[]
}
