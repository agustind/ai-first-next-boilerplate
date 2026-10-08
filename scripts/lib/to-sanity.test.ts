import { describe, expect, it } from 'vitest'
import { demoPages, demoPosts, demoRedirects, demoSettings } from '@/features/cms/demo/content'
import {
  collectImageSources,
  demoToSanityDocuments,
  pageId,
  toBlocks,
  validateDocument,
} from './to-sanity'

const content = {
  settings: demoSettings,
  pages: demoPages,
  posts: demoPosts,
  redirects: demoRedirects,
}
const documents = demoToSanityDocuments(content, (src) => `image-${src.replace(/\W/g, '')}`)

function walkArrays(value: unknown, path: string, visit: (item: unknown, path: string) => void) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      visit(item, `${path}[${index}]`)
      walkArrays(item, `${path}[${index}]`, visit)
    })
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) walkArrays(child, `${path}.${key}`, visit)
  }
}

describe('demo → Sanity documents', () => {
  it('produces the expected singleton, pages, posts and references', () => {
    const ids = documents.map((doc) => doc._id)
    expect(ids).toContain('siteSettings')
    expect(ids).toContain('page-home')
    expect(ids).toContain('page-about')
    expect(pageId('/services/web')).toBe('page-services-web')
    expect(ids).toContain('post-schema-as-a-system')
    expect(ids).toContain('author-ada-example')
    expect(new Set(ids).size).toBe(ids.length)
    const home = documents.find((doc) => doc._id === 'page-home')
    expect(home?.slug).toEqual({ _type: 'slug', current: 'index' })
  })

  it('every page section keeps its type and gets a _key', () => {
    for (const page of documents.filter((doc) => doc._type === 'page')) {
      const sections = page.sections as { _type: string; _key: string }[]
      expect(sections.length).toBeGreaterThan(0)
      for (const section of sections) {
        expect(section._type).toMatch(/Section$/)
        expect(section._key).toMatch(/^[a-zA-Z0-9-]+$/)
      }
    }
  })

  it('every object in every array has a unique _key', () => {
    for (const doc of documents) {
      walkArrays(doc, doc._id, (item, path) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          expect(typeof (item as { _key?: unknown })._key, path).toBe('string')
        }
      })
    }
  })

  it('converts links and images to Sanity shapes', () => {
    const home = documents.find((doc) => doc._id === 'page-home')
    const hero = (home?.sections as Record<string, unknown>[] | undefined)?.[0]
    expect((hero?.actions as unknown[] | undefined)?.[0]).toMatchObject({
      _type: 'link',
      linkType: 'external',
      url: '/#get-started',
    })
    expect(hero?.image).toMatchObject({
      _type: 'image',
      asset: { _type: 'reference' },
      alt: expect.any(String),
    })
  })

  it('matches the Studio schema', () => {
    expect(documents.flatMap(validateDocument)).toEqual([])
  })

  it('collects every image source once', () => {
    expect(collectImageSources(content).sort()).toEqual([
      '/placeholders/hero.svg',
      '/placeholders/media.svg',
    ])
  })

  it('degrades HTML rich text to a plain block', () => {
    const blocks = toBlocks({ format: 'html', html: '<p>Hello <b>you</b></p>' }, () => 'x', 'b')
    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ _type: 'block', _key: 'b-0' })
  })
})
