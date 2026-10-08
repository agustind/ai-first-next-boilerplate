import { defineSection } from '../../define'
import { ctaSectionToMarkdown } from './markdown'
import { ctaSectionModel } from './model'
import { ctaSectionSample } from './sample'
import { CtaSection } from './section'

export const ctaSection = defineSection({
  type: 'ctaSection',
  title: 'Call to action',
  description:
    'A short prompt with one or two buttons. Use to close a page or break up long content.',
  model: ctaSectionModel,
  component: CtaSection,
  sample: ctaSectionSample,
  toMarkdown: ctaSectionToMarkdown,
})
