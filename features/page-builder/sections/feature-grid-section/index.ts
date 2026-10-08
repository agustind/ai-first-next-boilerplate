import { defineSection } from '../../define'
import { featureGridSectionToMarkdown } from './markdown'
import { featureGridSectionModel } from './model'
import { featureGridSectionSample } from './sample'
import { FeatureGridSection } from './section'

export const featureGridSection = defineSection({
  type: 'featureGridSection',
  title: 'Feature grid',
  description: 'A grid of short title + text items. Use for benefits, services or capabilities.',
  model: featureGridSectionModel,
  component: FeatureGridSection,
  sample: featureGridSectionSample,
  toMarkdown: featureGridSectionToMarkdown,
})
