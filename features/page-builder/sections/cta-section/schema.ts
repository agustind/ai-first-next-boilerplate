import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { sectionGroups, sectionSettingsFields } from '@/sanity/schemas/fields'

export const ctaSectionSchema = defineType({
  name: 'ctaSection',
  title: 'Call to action',
  type: 'object',
  icon: BulbOutlineIcon,
  groups: sectionGroups,
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'text', type: 'text', rows: 2, group: 'content' }),
    defineField({
      name: 'actions',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'link' })],
      validation: (rule) => rule.required().min(1).max(2),
    }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title, subtitle: 'Call to action' }),
  },
})
