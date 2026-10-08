import { defineDirectusSection } from '@/features/cms/directus/spec'

export const mediaSectionDirectus = defineDirectusSection({
  type: 'mediaSection',
  collection: 'section_media',
  fields: [
    { field: 'image', kind: 'image', required: true },
    { field: 'caption', kind: 'string' },
    { field: 'size', kind: 'select', choices: ['contained', 'full'], default: 'contained' },
  ],
})
