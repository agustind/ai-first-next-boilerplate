import { z } from 'zod'
import {
  cleanEnum,
  imageSchema,
  linkSchema,
  list,
  optional,
  withDefault,
} from '@/features/cms/model/primitives'
import { sectionBase } from '../../define'

export const heroSectionModel = z.object({
  type: z.literal('heroSection'),
  ...sectionBase,
  eyebrow: optional(z.string()),
  heading: z.string(),
  text: optional(z.string()),
  image: optional(imageSchema),
  actions: list(linkSchema),
  layout: withDefault(cleanEnum(['centered', 'split']), 'centered'),
})

export type HeroSectionModel = z.infer<typeof heroSectionModel>
