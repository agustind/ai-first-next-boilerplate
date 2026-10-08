import { defineSection } from '../../define'
import { heroSectionToMarkdown } from './markdown'
import { heroSectionModel } from './model'
import { heroSectionSample } from './sample'
import { HeroSection } from './section'

export const heroSection = defineSection({
  type: 'heroSection',
  title: 'Hero',
  description:
    'Opening statement with heading, supporting text, up to two actions and an optional image.',
  model: heroSectionModel,
  component: HeroSection,
  sample: heroSectionSample,
  toMarkdown: heroSectionToMarkdown,
})
