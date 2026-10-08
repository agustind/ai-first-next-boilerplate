import { describe, expect, it } from 'vitest'
import { buildLlmsTxt } from './llms-txt'

describe('buildLlmsTxt', () => {
  it('lists indexable pages and posts with markdown links', () => {
    const txt = buildLlmsTxt({
      siteUrl: 'https://example.com',
      settings: {
        siteName: 'Acme',
        description: 'We make things',
        navigation: [],
        footer: { links: [] },
        social: [],
      },
      routes: [
        { uri: '/', title: 'Home', type: 'page', updatedAt: '', noIndex: false },
        { uri: '/secret', title: 'Secret', type: 'page', updatedAt: '', noIndex: true },
        { uri: '/blog/hello', title: 'Hello', type: 'post', updatedAt: '', noIndex: false },
      ],
    })
    expect(txt).toMatch(/^# Acme\n\n> We make things/)
    expect(txt).toContain('- [Home](https://example.com/index.md)')
    expect(txt).toContain('## Blog\n\n- [Hello](https://example.com/blog/hello.md)')
    expect(txt).not.toContain('Secret')
  })
})
