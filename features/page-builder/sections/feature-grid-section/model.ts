import { z } from 'zod'
import { list, optional } from '@/features/cms/model/primitives'
import { sectionBase } from '../../define'

export const featureGridSectionModel = z.object({
  type: z.literal('featureGridSection'),
  ...sectionBase,
  heading: optional(z.string()),
  intro: optional(z.string()),
  items: list(z.object({ title: z.string(), text: z.string() })),
})

export type FeatureGridSectionModel = z.infer<typeof featureGridSectionModel>
