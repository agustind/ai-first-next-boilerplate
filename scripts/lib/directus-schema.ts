/**
 * Directus schema-as-code → the list of API operations that create it.
 * Pure (no network) so it can be printed with --dry-run and unit-tested.
 * Payload shapes follow the Directus REST API (/collections, /fields, /relations).
 */
import { directusCollections } from '@/features/cms/directus/collections'
import { directusSections } from '@/features/cms/directus/sections'
import type { DirectusCollectionSpec, DirectusFieldSpec } from '@/features/cms/directus/spec'

type Json = Record<string, unknown>

export type Operation =
  | { kind: 'collection'; collection: string; payload: Json }
  | { kind: 'field'; collection: string; field: string; payload: Json }
  | { kind: 'relation'; collection: string; field: string; payload: Json }

export const JUNCTION = 'pages_sections'

/** Collections the Public policy may read (published filter applied where there's a status). */
export function publicReadCollections() {
  return [
    ...directusCollections
      .filter((spec) => spec.collection !== 'form_submissions')
      .map((spec) => ({ collection: spec.collection, publishedOnly: Boolean(spec.status) })),
    ...directusSections.map((spec) => ({ collection: spec.collection, publishedOnly: false })),
    { collection: JUNCTION, publishedOnly: false },
    { collection: 'directus_files', publishedOnly: false },
  ]
}

/** Everything the site's own token reads (drafts included, for preview). */
export function websiteReadCollections() {
  return publicReadCollections().map(({ collection }) => collection)
}

const choices = (values: readonly string[]) =>
  values.map((value) => ({ text: value.charAt(0).toUpperCase() + value.slice(1), value }))

const meta = (spec: { note?: string; required?: boolean }, extra: Json = {}) => ({
  ...(spec.note ? { note: spec.note } : {}),
  ...(spec.required ? { required: true } : {}),
  ...extra,
})

/** A sub-field inside a JSON `list` interface (links, repeaters). */
function listSubfield(spec: DirectusFieldSpec): Json {
  const base = { field: spec.field, name: spec.field }
  switch (spec.kind) {
    case 'string':
      return { ...base, type: 'string', meta: meta(spec, { interface: 'input', width: 'full' }) }
    case 'text':
      return {
        ...base,
        type: 'text',
        meta: meta(spec, { interface: 'input-multiline', width: 'full' }),
      }
    case 'richText':
      return {
        ...base,
        type: 'text',
        meta: meta(spec, { interface: 'input-rich-text-html', width: 'full' }),
      }
    case 'boolean':
      return { ...base, type: 'boolean', meta: meta(spec, { interface: 'boolean', width: 'half' }) }
    case 'select':
      return {
        ...base,
        type: 'string',
        meta: meta(spec, {
          interface: 'select-dropdown',
          width: 'half',
          options: { choices: choices(spec.choices) },
        }),
      }
    default:
      throw new Error(
        `Field kind "${spec.kind}" is not supported inside a repeater (${spec.field})`,
      )
  }
}

const LINK_SUBFIELDS: DirectusFieldSpec[] = [
  { field: 'label', kind: 'string', required: true },
  { field: 'href', kind: 'string', required: true, note: 'Path (/about) or full URL' },
]

/** One spec field → createField payload (+ relation when it points at another collection). */
export function fieldOperations(collection: string, spec: DirectusFieldSpec): Operation[] {
  const field = (payload: Json): Operation => ({
    kind: 'field',
    collection,
    field: spec.field,
    payload,
  })
  const relation = (related: string): Operation => ({
    kind: 'relation',
    collection,
    field: spec.field,
    payload: {
      collection,
      field: spec.field,
      related_collection: related,
      schema: { on_delete: 'SET NULL' },
    },
  })

  switch (spec.kind) {
    case 'string':
      return [
        field({ field: spec.field, type: 'string', meta: meta(spec, { interface: 'input' }) }),
      ]
    case 'text':
      return [
        field({
          field: spec.field,
          type: 'text',
          meta: meta(spec, { interface: 'input-multiline' }),
        }),
      ]
    case 'richText':
      return [
        field({
          field: spec.field,
          type: 'text',
          meta: meta(spec, { interface: 'input-rich-text-html' }),
        }),
      ]
    case 'boolean':
      return [
        field({
          field: spec.field,
          type: 'boolean',
          meta: meta(spec, { interface: 'boolean', width: 'half' }),
          schema: { default_value: false },
        }),
      ]
    case 'select':
      return [
        field({
          field: spec.field,
          type: 'string',
          meta: meta(spec, {
            interface: 'select-dropdown',
            width: 'half',
            options: { choices: choices(spec.choices) },
          }),
          schema: { default_value: spec.default },
        }),
      ]
    case 'datetime':
      return [
        field({
          field: spec.field,
          type: 'timestamp',
          meta: meta(spec, { interface: 'datetime', width: 'half' }),
        }),
      ]
    case 'json':
      return [
        field({
          field: spec.field,
          type: 'json',
          meta: meta(spec, {
            interface: 'input-code',
            special: ['cast-json'],
            options: { language: 'json' },
          }),
        }),
      ]
    case 'tags':
      return [
        field({
          field: spec.field,
          type: 'csv',
          meta: meta(spec, { interface: 'tags', special: ['cast-csv'] }),
        }),
      ]
    case 'links':
      return [
        field({
          field: spec.field,
          type: 'json',
          meta: meta(spec, {
            interface: 'list',
            special: ['cast-json'],
            options: { template: '{{label}} → {{href}}', fields: LINK_SUBFIELDS.map(listSubfield) },
          }),
        }),
      ]
    case 'repeater':
      return [
        field({
          field: spec.field,
          type: 'json',
          meta: meta(spec, {
            interface: 'list',
            special: ['cast-json'],
            options: {
              template: `{{${spec.fields[0]?.field ?? 'id'}}}`,
              fields: spec.fields.map(listSubfield),
            },
          }),
        }),
      ]
    case 'image':
      return [
        field({
          field: spec.field,
          type: 'uuid',
          meta: meta(spec, { interface: 'file-image', special: ['file'] }),
        }),
        relation('directus_files'),
      ]
    case 'm2o':
      return [
        field({
          field: spec.field,
          type: 'integer',
          meta: meta(spec, { interface: 'select-dropdown-m2o', special: ['m2o'] }),
        }),
        relation(spec.related),
      ]
  }
}

function collectionOperation(collection: string, extraMeta: Json = {}): Operation {
  return {
    kind: 'collection',
    collection,
    payload: {
      collection,
      meta: { icon: 'article', ...extraMeta },
      schema: {},
      fields: [
        {
          field: 'id',
          type: 'integer',
          meta: { hidden: true, interface: 'input', readonly: true },
          schema: { is_primary_key: true, has_auto_increment: true },
        },
      ],
    },
  }
}

const STATUS_FIELD: Operation['payload'] = {
  field: 'status',
  type: 'string',
  meta: {
    interface: 'select-dropdown',
    display: 'labels',
    width: 'full',
    options: { choices: choices(['published', 'draft']) },
  },
  schema: { default_value: 'draft', is_nullable: false },
}

const ACCOUNTABILITY_FIELDS = [
  {
    field: 'date_created',
    type: 'timestamp',
    meta: {
      special: ['date-created'],
      interface: 'datetime',
      readonly: true,
      hidden: true,
      width: 'half',
    },
  },
  {
    field: 'date_updated',
    type: 'timestamp',
    meta: {
      special: ['date-updated'],
      interface: 'datetime',
      readonly: true,
      hidden: true,
      width: 'half',
    },
  },
]

function coreCollectionOperations(spec: DirectusCollectionSpec): Operation[] {
  const ops: Operation[] = [
    collectionOperation(spec.collection, {
      singleton: Boolean(spec.singleton),
      ...(spec.displayTemplate ? { display_template: spec.displayTemplate } : {}),
      ...(spec.status
        ? { archive_field: 'status', archive_app_filter: true, unarchive_value: 'draft' }
        : {}),
    }),
  ]
  if (spec.status) {
    ops.push({ kind: 'field', collection: spec.collection, field: 'status', payload: STATUS_FIELD })
    for (const payload of ACCOUNTABILITY_FIELDS) {
      ops.push({
        kind: 'field',
        collection: spec.collection,
        field: String(payload.field),
        payload,
      })
    }
  }
  for (const field of spec.fields) ops.push(...fieldOperations(spec.collection, field))
  return ops
}

/** The page builder: section collections + `pages.sections` many-to-any via `pages_sections`. */
function pageBuilderOperations(): Operation[] {
  const ops: Operation[] = []
  for (const section of directusSections) {
    ops.push(collectionOperation(section.collection, { icon: 'view_agenda', hidden: true }))
    for (const field of section.fields) ops.push(...fieldOperations(section.collection, field))
    ops.push(
      ...fieldOperations(section.collection, {
        field: 'anchor',
        kind: 'string',
        note: 'Lets links target this section (#anchor).',
      }),
      ...fieldOperations(section.collection, {
        field: 'tone',
        kind: 'select',
        choices: ['default', 'muted', 'inverted'],
        default: 'default',
      }),
    )
  }

  ops.push(collectionOperation(JUNCTION, { icon: 'import_export', hidden: true }))
  const hidden = { hidden: true }
  ops.push(
    {
      kind: 'field',
      collection: JUNCTION,
      field: 'pages_id',
      payload: { field: 'pages_id', type: 'integer', meta: hidden },
    },
    {
      kind: 'field',
      collection: JUNCTION,
      field: 'item',
      payload: { field: 'item', type: 'string', meta: hidden },
    },
    {
      kind: 'field',
      collection: JUNCTION,
      field: 'collection',
      payload: { field: 'collection', type: 'string', meta: hidden },
    },
    {
      kind: 'field',
      collection: JUNCTION,
      field: 'sort',
      payload: { field: 'sort', type: 'integer', meta: hidden },
    },
    {
      kind: 'field',
      collection: 'pages',
      field: 'sections',
      payload: {
        field: 'sections',
        type: 'alias',
        meta: { interface: 'list-m2a', special: ['m2a'], options: {} },
      },
    },
    {
      kind: 'relation',
      collection: JUNCTION,
      field: 'item',
      payload: {
        collection: JUNCTION,
        field: 'item',
        related_collection: null,
        meta: {
          one_allowed_collections: directusSections.map((section) => section.collection),
          one_collection_field: 'collection',
          junction_field: 'pages_id',
        },
        schema: null,
      },
    },
    {
      kind: 'relation',
      collection: JUNCTION,
      field: 'pages_id',
      payload: {
        collection: JUNCTION,
        field: 'pages_id',
        related_collection: 'pages',
        meta: {
          one_field: 'sections',
          junction_field: 'item',
          sort_field: 'sort',
          one_deselect_action: 'delete',
        },
        schema: { on_delete: 'CASCADE' },
      },
    },
  )
  return ops
}

/**
 * Full plan in dependency order: collections first (relations need both
 * sides), then fields, then relations.
 */
export function planSchema(): Operation[] {
  const all = [...directusCollections.flatMap(coreCollectionOperations), ...pageBuilderOperations()]
  const order = { collection: 0, field: 1, relation: 2 } as const
  return all
    .map((op, index) => ({ op, index }))
    .sort((a, b) => order[a.op.kind] - order[b.op.kind] || a.index - b.index)
    .map(({ op }) => op)
}
