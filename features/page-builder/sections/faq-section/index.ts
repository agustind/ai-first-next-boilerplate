import { defineSection } from '../../define'
import { faqSectionJsonLd, faqSectionToMarkdown } from './markdown'
import { faqSectionModel } from './model'
import { faqSectionSample } from './sample'
import { FaqSection } from './section'

export const faqSection = defineSection({
  type: 'faqSection',
  title: 'FAQ',
  description:
    'Questions and answers. Emits FAQPage structured data for search and answer engines.',
  model: faqSectionModel,
  component: FaqSection,
  sample: faqSectionSample,
  toMarkdown: faqSectionToMarkdown,
  jsonLd: faqSectionJsonLd,
})
