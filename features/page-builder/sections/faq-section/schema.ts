import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { richTextField, sectionGroups, sectionSettingsFields } from '@/sanity/schemas/fields'

export const faqSectionSchema = defineType({
  name: 'faqSection',
  title: 'FAQ',
  type: 'object',
  icon: HelpCircleIcon,
  groups: sectionGroups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content' }),
    defineField({
      name: 'items',
      type: 'array',
      group: 'content',
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            richTextField('answer', { required: true }),
          ],
          preview: { select: { title: 'question' } },
        }),
      ],
    }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: 'heading', items: 'items' },
    prepare: ({ title, items }) => ({
      title: title || 'FAQ',
      subtitle: `FAQ · ${Array.isArray(items) ? items.length : 0} questions`,
    }),
  },
})
