import { richTextToMarkdown, richTextToPlainText } from '@/features/rich-text/to-markdown'
import type { FaqSectionModel } from './model'

export function faqSectionToMarkdown(section: FaqSectionModel) {
  return [
    section.heading ? `## ${section.heading}` : '',
    ...section.items.map((item) => `### ${item.question}\n\n${richTextToMarkdown(item.answer)}`),
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** FAQPage structured data: makes Q&A eligible for rich results and answer engines. */
export function faqSectionJsonLd(section: FaqSectionModel) {
  if (section.items.length === 0) return null
  return {
    '@type': 'FAQPage',
    mainEntity: section.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: richTextToPlainText(item.answer) },
    })),
  }
}
