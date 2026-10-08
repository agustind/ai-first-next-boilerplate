import { defineDirectusSection } from '@/features/cms/directus/spec'

export const faqSectionDirectus = defineDirectusSection({
  type: 'faqSection',
  collection: 'section_faq',
  fields: [
    { field: 'heading', kind: 'string' },
    {
      field: 'items',
      kind: 'repeater',
      fields: [
        { field: 'question', kind: 'string', required: true },
        { field: 'answer', kind: 'richText' },
      ],
    },
  ],
})
