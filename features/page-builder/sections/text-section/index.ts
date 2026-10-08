import { defineSection } from '../../define'
import { textSectionToMarkdown } from './markdown'
import { textSectionModel } from './model'
import { textSectionSample } from './sample'
import { TextSection } from './section'

export const textSection = defineSection({
  type: 'textSection',
  title: 'Text',
  description:
    'Long-form rich text with an optional heading. Use for articles, legal copy and explanations.',
  model: textSectionModel,
  component: TextSection,
  sample: textSectionSample,
  toMarkdown: textSectionToMarkdown,
})
