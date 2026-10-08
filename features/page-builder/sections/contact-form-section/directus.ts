import { defineDirectusSection } from '@/features/cms/directus/spec'

export const contactFormSectionDirectus = defineDirectusSection({
  type: 'contactFormSection',
  collection: 'section_contact_form',
  fields: [
    { field: 'heading', kind: 'string' },
    { field: 'text', kind: 'text' },
  ],
})
