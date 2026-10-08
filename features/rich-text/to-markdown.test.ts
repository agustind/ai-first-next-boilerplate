import { describe, expect, it } from 'vitest'
import { paragraphs, portableTextToMarkdown, richTextToMarkdown } from './to-markdown'

const span = (text: string, marks: string[] = []) => ({ _type: 'span', text, marks })

describe('portableTextToMarkdown', () => {
  it('renders headings, marks and links', () => {
    const md = portableTextToMarkdown([
      { _type: 'block', style: 'h2', children: [span('Title')] },
      {
        _type: 'block',
        style: 'normal',
        markDefs: [{ _key: 'l1', _type: 'link', href: '/about' }],
        children: [span('Read '), span('this', ['strong']), span(' and '), span('more', ['l1'])],
      },
    ])
    expect(md).toBe('## Title\n\nRead **this** and [more](/about)')
  })

  it('numbers ordered lists and nests by level', () => {
    const item = (text: string, listItem: string, level = 1) => ({
      _type: 'block',
      listItem,
      level,
      children: [span(text)],
    })
    const md = portableTextToMarkdown([
      item('one', 'number'),
      item('two', 'number'),
      item('nested', 'bullet', 2),
    ])
    expect(md).toBe('1. one\n2. two\n  - nested')
  })

  it('renders image blocks with alt text', () => {
    const md = portableTextToMarkdown([
      { _type: 'image', image: { src: 'https://cdn/x.jpg', alt: 'A cat' }, caption: 'Cat' },
    ])
    expect(md).toBe('![A cat](https://cdn/x.jpg)\n_Cat_')
  })
})

describe('richTextToMarkdown', () => {
  it('converts HTML (Directus) to markdown', () => {
    expect(
      richTextToMarkdown({ format: 'html', html: '<h2>Hi</h2><p>A <strong>b</strong></p>' }),
    ).toBe('## Hi\n\nA **b**')
  })

  it('round-trips paragraphs()', () => {
    expect(richTextToMarkdown(paragraphs('a', 'b'))).toBe('a\n\nb')
  })
})
