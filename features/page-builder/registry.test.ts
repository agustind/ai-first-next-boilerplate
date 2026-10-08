import { describe, expect, it } from 'vitest'
import { directusSections } from '@/features/cms/directus/sections'
import { sectionSchemas } from '@/sanity/schemas/sections'
import { sectionSchema } from './model'
import { sectionQueries } from './queries'
import { sectionDefinitions, sectionRegistry } from './registry'

/**
 * Schema as a system: a section exists in four registries (frontend, Sanity
 * schema, GROQ, Directus). These tests fail when one is forgotten.
 */
const modelTypes = sectionSchema.options.map((option) => option.shape.type.value).sort()

describe('section registries', () => {
  it('frontend registry matches the content model union', () => {
    expect(Object.keys(sectionRegistry).sort()).toEqual(modelTypes)
    for (const [key, definition] of Object.entries(sectionRegistry))
      expect(definition.type).toBe(key)
  })

  it('every section has a Sanity schema', () => {
    expect(sectionSchemas.map((schema) => schema.name).sort()).toEqual(modelTypes)
  })

  it('every section has a GROQ projection', () => {
    expect(Object.keys(sectionQueries).sort()).toEqual(modelTypes)
  })

  it('every section has a Directus spec with a unique collection', () => {
    expect(directusSections.map((spec) => spec.type).sort()).toEqual(modelTypes)
    const collections = directusSections.map((spec) => spec.collection)
    expect(new Set(collections).size).toBe(collections.length)
  })
})

describe.each(sectionDefinitions.map((definition) => [definition.type, definition] as const))(
  '%s',
  (_type, definition) => {
    it('sample content passes the model', () => {
      const result = definition.model.safeParse(definition.sample)
      expect(result.error?.issues ?? []).toEqual([])
    })

    it('renders markdown from the sample', () => {
      const section = definition.model.parse(definition.sample)
      expect(definition.toMarkdown(section).trim().length).toBeGreaterThan(0)
    })

    it('Sanity schema declares every model field', () => {
      const schema = sectionSchemas.find((s) => s.name === definition.type)
      const sanityFields = new Set(
        ((schema as { fields?: { name: string }[] }).fields ?? []).map((f) => f.name),
      )
      const modelFields = Object.keys(
        (sectionSchema.options.find((o) => o.shape.type.value === definition.type)?.shape ??
          {}) as object,
      ).filter((field) => !['type', 'key'].includes(field))
      expect(modelFields.filter((field) => !sanityFields.has(field))).toEqual([])
    })

    it('Directus spec declares every model field', () => {
      const spec = directusSections.find((s) => s.type === definition.type)
      const directusFields = new Set([
        ...(spec?.fields.map((f) => f.field) ?? []),
        'anchor',
        'tone',
      ])
      const modelFields = Object.keys(
        (sectionSchema.options.find((o) => o.shape.type.value === definition.type)?.shape ??
          {}) as object,
      ).filter((field) => !['type', 'key'].includes(field))
      expect(modelFields.filter((field) => !directusFields.has(field))).toEqual([])
    })
  },
)
