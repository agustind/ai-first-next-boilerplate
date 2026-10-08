import { z } from 'zod'
import { linkSchema, list, optional } from '@/features/cms/model/primitives'
import { sectionBase } from '../../define'

export const ctaSectionModel = z.object({
  type: z.literal('ctaSection'),
  ...sectionBase,
  heading: z.string(),
  text: optional(z.string()),
  actions: list(linkSchema),
})

export type CtaSectionModel = z.infer<typeof ctaSectionModel>
