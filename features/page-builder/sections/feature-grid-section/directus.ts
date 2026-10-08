import { defineDirectusSection } from '@/features/cms/directus/spec'

export const featureGridSectionDirectus = defineDirectusSection({
  type: 'featureGridSection',
  collection: 'section_feature_grid',
  fields: [
    { field: 'heading', kind: 'string' },
    { field: 'intro', kind: 'text' },
    {
      field: 'items',
      kind: 'repeater',
      fields: [
        { field: 'title', kind: 'string', required: true },
        { field: 'text', kind: 'text', required: true },
      ],
    },
  ],
})
