import { describe, expect, it } from 'vitest'
import { parseMcpBody } from './agent-readiness'
import { extractInternalLinks, parseSitemap } from './crawl-site'

describe('parseSitemap', () => {
  it('extracts and decodes <loc> entries', () => {
    const xml = `<?xml version="1.0"?><urlset><url><loc>https://a.com/</loc></url><url><loc> https://a.com/x?a=1&amp;b=2 </loc></url></urlset>`
    expect(parseSitemap(xml)).toEqual(['https://a.com/', 'https://a.com/x?a=1&b=2'])
  })
})

describe('extractInternalLinks', () => {
  it('keeps same-origin links, drops fragments and other schemes', () => {
    const html = `<a href="/about">a</a><a href="/about#team">b</a><a href="https://other.com">c</a>
      <a href="mailto:x@y.z">d</a><a href="#top">e</a><a href="blog/post">f</a>`
    expect(extractInternalLinks(html, 'https://a.com/base/')).toEqual([
      'https://a.com/about',
      'https://a.com/base/blog/post',
    ])
  })
})

describe('parseMcpBody', () => {
  it('reads JSON and SSE bodies', () => {
    expect(parseMcpBody('{"jsonrpc":"2.0","id":1,"result":{"a":1}}')?.result).toEqual({ a: 1 })
    expect(
      parseMcpBody('event: message\ndata: {"jsonrpc":"2.0","id":1,"result":{"b":2}}\n\n')?.result,
    ).toEqual({ b: 2 })
    expect(parseMcpBody('nope')).toBeNull()
  })
})
