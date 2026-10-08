import { describe, expect, it } from 'vitest'
import { directusCollections } from '@/features/cms/directus/collections'
import { directusSections } from '@/features/cms/directus/sections'
import { JUNCTION, planSchema, publicReadCollections } from './directus-schema'

const plan = planSchema()
const ids = plan.map((op) =>
  op.kind === 'collection' ? op.collection : `${op.kind}:${op.collection}.${op.field}`,
)

describe('directus schema plan', () => {
  it('creates every core and section collection before any field or relation', () => {
    const expected = [
      ...directusCollections.map((c) => c.collection),
      ...directusSections.map((s) => s.collection),
      JUNCTION,
    ]
    for (const collection of expected) expect(ids).toContain(collection)
    const lastCollection = Math.max(...plan.map((op, i) => (op.kind === 'collection' ? i : -1)))
    const firstOther = plan.findIndex((op) => op.kind !== 'collection')
    expect(lastCollection).toBeLessThan(firstOther)
  })

  it('has no duplicate operations', () => {
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('creates the fields the adapter queries', () => {
    for (const field of [
      'status',
      'date_created',
      'date_updated',
      'uri',
      'seo_image',
      'sections',
    ]) {
      expect(ids).toContain(`field:pages.${field}`)
    }
    for (const field of ['slug', 'published_at', 'tags', 'author', 'body'])
      expect(ids).toContain(`field:posts.${field}`)
    for (const section of directusSections) {
      expect(ids).toContain(`field:${section.collection}.anchor`)
      expect(ids).toContain(`field:${section.collection}.tone`)
    }
  })

  it('wires images to directus_files and the many-to-any builder', () => {
    const imageRelation = plan.find(
      (op) => op.kind === 'relation' && op.collection === 'pages' && op.field === 'seo_image',
    )
    expect(imageRelation?.payload.related_collection).toBe('directus_files')
    const item = plan.find((op) => op.kind === 'relation' && op.field === 'item')
    const itemMeta = item?.payload.meta as { one_allowed_collections?: string[] } | undefined
    expect(itemMeta?.one_allowed_collections).toEqual(directusSections.map((s) => s.collection))
    const parent = plan.find((op) => op.kind === 'relation' && op.field === 'pages_id')
    expect(parent?.payload.meta).toMatchObject({
      one_field: 'sections',
      junction_field: 'item',
      sort_field: 'sort',
    })
  })

  it('never makes form submissions public', () => {
    expect(publicReadCollections().map((p) => p.collection)).not.toContain('form_submissions')
    expect(publicReadCollections().find((p) => p.collection === 'pages')?.publishedOnly).toBe(true)
  })
})
