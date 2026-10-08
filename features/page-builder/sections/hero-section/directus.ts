import { defineDirectusSection } from '@/features/cms/directus/spec'

export const heroSectionDirectus = defineDirectusSection({
  type: 'heroSection',
  collection: 'section_hero',
  fields: [
    { field: 'eyebrow', kind: 'string' },
    { field: 'heading', kind: 'string', required: true },
    { field: 'text', kind: 'text' },
    { field: 'image', kind: 'image' },
    { field: 'actions', kind: 'links' },
    { field: 'layout', kind: 'select', choices: ['centered', 'split'], default: 'centered' },
  ],
})
