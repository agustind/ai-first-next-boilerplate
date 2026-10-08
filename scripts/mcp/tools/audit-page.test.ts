import { describe, expect, it } from 'vitest'
import { auditHtml } from './audit-page'

const page = (head: string, body: string, lang = ' lang="en"') =>
  `<!doctype html><html${lang}><head>${head}</head><body>${body}</body></html>`

const GOOD_HEAD = [
  '<title>Good page title</title>',
  '<meta name="description" content="A perfectly reasonable description that is long enough to be useful.">',
  '<link rel="canonical" href="https://example.com/good">',
  '<meta property="og:title" content="Good">',
  '<meta property="og:image" content="https://example.com/og.png">',
  '<link rel="alternate" type="text/markdown" href="/good.md">',
  '<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite"},{"@type":"Organization"}]}</script>',
].join('')

const errors = (html: string, status = 200) =>
  auditHtml(html, { status })
    .filter((f) => f.severity !== 'info')
    .map((f) => f.message)

describe('auditHtml', () => {
  it('passes a well-formed page', () => {
    expect(
      errors(page(GOOD_HEAD, '<h1>Hi</h1><h2>Sub</h2><img src="/a.png" alt=""><a href="/x">X</a>')),
    ).toEqual([])
  })

  it('flags missing basics', () => {
    const messages = errors(page('', '<h2>No h1</h2>', ''), 404)
    expect(messages).toEqual(
      expect.arrayContaining([
        'HTTP 404',
        'Missing <html lang> attribute',
        'Missing <title>',
        'Missing meta description',
        'Expected exactly one <h1>, found 0',
        'No JSON-LD structured data',
      ]),
    )
  })

  it('flags skipped headings, images without alt and empty links', () => {
    const messages = errors(
      page(GOOD_HEAD, '<h1>A</h1><h3>C</h3><img src="/x.png"><a href="/y"></a>'),
    )
    expect(messages.some((m) => m.startsWith('Heading level skips from h1 to h3'))).toBe(true)
    expect(messages).toContain('1 <img> without alt: /x.png')
    expect(messages).toContain('1 link(s) without accessible text: /y')
  })

  it('flags invalid JSON-LD, noindex and failed CMS sections', () => {
    const head = `${GOOD_HEAD}<script type="application/ld+json">{oops</script><meta name="robots" content="noindex">`
    const messages = errors(
      page(head, '<h1>A</h1><template data-section-error="heroSection"></template>'),
    )
    expect(messages).toContain('A JSON-LD <script> is not valid JSON')
    expect(messages).toContain('Page is noindex (robots: "noindex")')
    expect(messages).toContain(
      'CMS section(s) failed validation and were not rendered: heroSection',
    )
  })

  it('lists JSON-LD types from @graph', () => {
    const info = auditHtml(page(GOOD_HEAD, '<h1>A</h1>'), { status: 200 }).map((f) => f.message)
    expect(info).toContain('JSON-LD types: WebSite, Organization')
  })
})
