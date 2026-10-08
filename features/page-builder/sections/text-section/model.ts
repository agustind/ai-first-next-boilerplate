import { z } from 'zod'
import { cleanEnum, optional, richTextSchema, withDefault } from '@/features/cms/model/primitives'
import { sectionBase } from '../../define'

export const textSectionModel = z.object({
  type: z.literal('textSection'),
  ...sectionBase,
  heading: optional(z.string()),
  body: richTextSchema,
  width: withDefault(cleanEnum(['narrow', 'wide']), 'narrow'),
})

export type TextSectionModel = z.infer<typeof textSectionModel>
