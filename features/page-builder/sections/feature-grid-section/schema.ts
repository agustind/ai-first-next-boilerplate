import { ThLargeIcon } from '@sanity/icons/ThLarge'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { sectionGroups, sectionSettingsFields } from '@/sanity/schemas/fields'

export const featureGridSectionSchema = defineType({
  name: 'featureGridSection',
  title: 'Feature grid',
  type: 'object',
  icon: ThLargeIcon,
  groups: sectionGroups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content' }),
    defineField({ name: 'intro', type: 'text', rows: 2, group: 'content' }),
    defineField({
      name: 'items',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'featureItem',
          fields: [
            defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
            defineField({
              name: 'text',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Features', subtitle: 'Feature grid' }),
  },
})
