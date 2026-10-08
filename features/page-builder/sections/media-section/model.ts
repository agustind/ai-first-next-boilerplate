import { z } from 'zod'
import { cleanEnum, imageSchema, optional, withDefault } from '@/features/cms/model/primitives'
import { sectionBase } from '../../define'

export const mediaSectionModel = z.object({
  type: z.literal('mediaSection'),
  ...sectionBase,
  image: imageSchema,
  caption: optional(z.string()),
  size: withDefault(cleanEnum(['contained', 'full']), 'contained'),
})

export type MediaSectionModel = z.infer<typeof mediaSectionModel>
