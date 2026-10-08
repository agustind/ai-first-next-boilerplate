import TurndownService from 'turndown'
import type { RichText, RichTextNode } from '@/features/cms/model'

type Span = { _type: 'span'; text?: string; marks?: string[] }
type MarkDef = { _key: string; _type: string; href?: string }

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})

const STYLE_PREFIX: Record<string, string> = {
  h1: '# ',
  h2: '## ',
  h3: '### ',
  h4: '#### ',
  h5: '##### ',
  h6: '###### ',
  blockquote: '> ',
}

function renderSpan(span: Span, markDefs: MarkDef[]) {
  let text = span.text ?? ''
  if (!text.trim()) return text
  for (const mark of span.marks ?? []) {
    if (mark === 'strong') text = `**${text}**`
    else if (mark === 'em') text = `_${text}_`
    else if (mark === 'code') text = `\`${text}\``
    else if (mark === 'strike-through') text = `~~${text}~~`
    else {
      const def = markDefs.find((d) => d._key === mark)
      if (def?._type === 'link' && def.href) text = `[${text}](${def.href})`
    }
  }
  return text
}

function renderBlock(node: RichTextNode) {
  const children = (node.children as Span[] | undefined) ?? []
  const markDefs = (node.markDefs as MarkDef[] | undefined) ?? []
  return children.map((child) => renderSpan(child, markDefs)).join('')
}

/** Portable Text → GitHub-flavoured Markdown. Unknown block types are skipped. */
export function portableTextToMarkdown(blocks: RichTextNode[]): string {
  const out: string[] = []
  let listCounters: number[] = []

  for (const node of blocks) {
    if (node._type === 'block') {
      const text = renderBlock(node)
      const listItem = node.listItem as string | undefined
      if (listItem) {
        const level = Math.max(1, Number(node.level ?? 1))
        listCounters = listCounters.slice(0, level)
        listCounters[level - 1] = (listCounters[level - 1] ?? 0) + 1
        const marker = listItem === 'number' ? `${listCounters[level - 1]}.` : '-'
        out.push(`${'  '.repeat(level - 1)}${marker} ${text}`)
        continue
      }
      listCounters = []
      if (!text.trim()) continue
      out.push('', `${STYLE_PREFIX[String(node.style ?? 'normal')] ?? ''}${text}`)
      continue
    }
    listCounters = []
    if (node._type === 'image') {
      const image = node.image as { src?: string; alt?: string } | undefined
      if (image?.src) out.push('', `![${image.alt ?? ''}](${image.src})`)
      if (typeof node.caption === 'string' && node.caption) out.push(`_${node.caption}_`)
    }
  }

  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function richTextToMarkdown(value: RichText): string {
  return value.format === 'html'
    ? turndown.turndown(value.html).trim()
    : portableTextToMarkdown(value.blocks)
}

/** Plain text, for meta descriptions and search indexes. */
export function richTextToPlainText(value: RichText): string {
  if (value.format === 'html')
    return value.html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  return value.blocks
    .filter((node) => node._type === 'block')
    .map((node) => ((node.children as Span[] | undefined) ?? []).map((c) => c.text ?? '').join(''))
    .join('\n\n')
}

/** Build simple Portable Text from paragraphs. Used by demo content and tests. */
export function paragraphs(...texts: string[]): RichText {
  return {
    format: 'portable-text',
    blocks: texts.map((text, i) => ({
      _type: 'block',
      _key: `p${i}`,
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: `p${i}s`, text, marks: [] }],
    })),
  }
}
