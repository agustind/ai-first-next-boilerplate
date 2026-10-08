import { describe, expect, it } from 'vitest'
import { buildRssFeed, escapeXml } from './feed'

describe('rss feed', () => {
  it('escapes XML special characters', () => {
    expect(escapeXml(`Tom & "Jerry" <3 it's`)).toBe('Tom &amp; &quot;Jerry&quot; &lt;3 it&apos;s')
  })

  it('renders items with absolute links', () => {
    const xml = buildRssFeed({
      siteUrl: 'https://example.com',
      settings: {
        siteName: 'A & B',
        description: '',
        navigation: [],
        footer: { links: [] },
        social: [],
      },
      posts: [
        {
          id: '1',
          title: 'Hello <world>',
          slug: 'hello',
          publishedAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          categories: [{ title: 'News', slug: 'news' }],
        },
      ],
    })
    expect(xml).toContain('<title>A &amp; B</title>')
    expect(xml).toContain('<title>Hello &lt;world&gt;</title>')
    expect(xml).toContain('<link>https://example.com/blog/hello</link>')
    expect(xml).toContain('<category>News</category>')
  })
})
