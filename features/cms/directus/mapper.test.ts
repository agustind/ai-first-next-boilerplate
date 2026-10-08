import { describe, expect, it } from 'vitest'
import { parseSections } from '@/features/page-builder/model'
import { mapImage, mapSections } from './mapper'
import { directusSections } from './sections'

const BASE = 'https://cms.example.com'

describe('directus mapper', () => {
  it('maps files to the image model', () => {
    expect(mapImage(BASE, { id: 'abc', width: 10, height: 5, description: 'Alt' })).toEqual({
      src: 'https://cms.example.com/assets/abc',
      alt: 'Alt',
      width: 10,
      height: 5,
    })
    expect(mapImage(BASE, null)).toBeNull()
  })

  it('maps many-to-any rows into valid sections', () => {
    const rows = [
      {
        id: 1,
        collection: 'section_hero',
        item: {
          id: 7,
          heading: 'Hello',
          actions: [{ label: 'Go', href: '/go' }],
          layout: 'split',
          image: { id: 'f1', width: 100, height: 50, description: 'Hero' },
          tone: null,
          anchor: null,
        },
      },
      {
        id: 2,
        collection: 'section_faq',
        item: { id: 3, heading: 'FAQ', items: [{ question: 'Q?', answer: '<p>A</p>' }] },
      },
      { id: 3, collection: 'section_unknown', item: { id: 1 } },
    ]
    const { sections, issues } = parseSections(mapSections(BASE, directusSections, rows))
    expect(issues).toEqual([])
    expect(sections.map((s) => s.type)).toEqual(['heroSection', 'faqSection'])
    const faq = sections[1]
    expect(faq?.type === 'faqSection' && faq.items[0]?.answer).toEqual({
      format: 'html',
      html: '<p>A</p>',
    })
  })
})
