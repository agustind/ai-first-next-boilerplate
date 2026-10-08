import { defineDirectusSection } from '@/features/cms/directus/spec'

export const ctaSectionDirectus = defineDirectusSection({
  type: 'ctaSection',
  collection: 'section_cta',
  fields: [
    { field: 'heading', kind: 'string', required: true },
    { field: 'text', kind: 'text' },
    { field: 'actions', kind: 'links' },
  ],
})
