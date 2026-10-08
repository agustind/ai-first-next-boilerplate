import { defineDirectusSection } from '@/features/cms/directus/spec'

export const textSectionDirectus = defineDirectusSection({
  type: 'textSection',
  collection: 'section_text',
  fields: [
    { field: 'heading', kind: 'string' },
    { field: 'body', kind: 'richText' },
    { field: 'width', kind: 'select', choices: ['narrow', 'wide'], default: 'narrow' },
  ],
})
