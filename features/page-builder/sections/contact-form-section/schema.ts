import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineField, defineType } from 'sanity'
import { sectionGroups, sectionSettingsFields } from '@/sanity/schemas/fields'

export const contactFormSectionSchema = defineType({
  name: 'contactFormSection',
  title: 'Contact form',
  type: 'object',
  icon: EnvelopeIcon,
  groups: sectionGroups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content' }),
    defineField({ name: 'text', type: 'text', rows: 2, group: 'content' }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Contact form', subtitle: 'Contact form' }),
  },
})
