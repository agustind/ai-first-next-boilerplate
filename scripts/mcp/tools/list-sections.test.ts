import { describe, expect, it } from 'vitest'
import { readSections } from './list-sections'

describe('readSections', () => {
  it('derives camelCase types from each section model', async () => {
    const sections = await readSections()
    expect(sections).toContainEqual({ folder: 'hero-section', type: 'heroSection' })
    expect(sections.every((s) => /^[a-z][A-Za-z]+Section$/.test(s.type))).toBe(true)
  })
})
