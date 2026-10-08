import { describe, expect, it } from 'vitest'
import { isMarkdownEligiblePath, prefersMarkdown } from './prefers-markdown'

describe('prefersMarkdown', () => {
  it('is false for browsers', () => {
    expect(prefersMarkdown('text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')).toBe(
      false,
    )
    expect(prefersMarkdown(undefined)).toBe(false)
    expect(prefersMarkdown('*/*')).toBe(false)
  })

  it('is true when markdown ranks first or ties', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true)
    expect(prefersMarkdown('text/markdown, text/html;q=0.9')).toBe(true)
    expect(prefersMarkdown('text/html, text/markdown')).toBe(true)
  })

  it('respects lower q for markdown', () => {
    expect(prefersMarkdown('text/html, text/markdown;q=0.5')).toBe(false)
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false)
  })
})

describe('isMarkdownEligiblePath', () => {
  it('accepts content routes only', () => {
    expect(isMarkdownEligiblePath('/')).toBe(true)
    expect(isMarkdownEligiblePath('/blog/hello')).toBe(true)
    expect(isMarkdownEligiblePath('/api/mcp')).toBe(false)
    expect(isMarkdownEligiblePath('/studio/structure')).toBe(false)
    expect(isMarkdownEligiblePath('/llms.txt')).toBe(false)
  })
})
