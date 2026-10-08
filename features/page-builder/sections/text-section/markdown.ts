import { richTextToMarkdown } from '@/features/rich-text/to-markdown'
import type { TextSectionModel } from './model'

export function textSectionToMarkdown(section: TextSectionModel) {
  return [section.heading ? `## ${section.heading}` : '', richTextToMarkdown(section.body)]
    .filter(Boolean)
    .join('\n\n')
}
