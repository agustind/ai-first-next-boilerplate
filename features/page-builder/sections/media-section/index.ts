import { defineSection } from '../../define'
import { mediaSectionToMarkdown } from './markdown'
import { mediaSectionModel } from './model'
import { mediaSectionSample } from './sample'
import { MediaSection } from './section'

export const mediaSection = defineSection({
  type: 'mediaSection',
  title: 'Media',
  description: 'A single large image with an optional caption, contained or full-bleed.',
  model: mediaSectionModel,
  component: MediaSection,
  sample: mediaSectionSample,
  toMarkdown: mediaSectionToMarkdown,
})
