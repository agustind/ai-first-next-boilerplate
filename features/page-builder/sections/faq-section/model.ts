import { z } from 'zod'
import { list, optional, richTextSchema } from '@/features/cms/model/primitives'
import { sectionBase } from '../../define'

export const faqSectionModel = z.object({
  type: z.literal('faqSection'),
  ...sectionBase,
  heading: optional(z.string()),
  items: list(z.object({ question: z.string(), answer: richTextSchema })),
})

export type FaqSectionModel = z.infer<typeof faqSectionModel>
