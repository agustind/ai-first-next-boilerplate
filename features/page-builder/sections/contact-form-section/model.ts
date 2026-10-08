import { z } from 'zod'
import { optional } from '@/features/cms/model/primitives'
import { sectionBase } from '../../define'

export const contactFormSectionModel = z.object({
  type: z.literal('contactFormSection'),
  ...sectionBase,
  heading: optional(z.string()),
  text: optional(z.string()),
})

export type ContactFormSectionModel = z.infer<typeof contactFormSectionModel>
