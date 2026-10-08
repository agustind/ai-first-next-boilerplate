import { TextIcon } from '@sanity/icons/Text'
import { defineField, defineType } from 'sanity'
import { richTextField, sectionGroups, sectionSettingsFields } from '@/sanity/schemas/fields'

export const textSectionSchema = defineType({
  name: 'textSection',
  title: 'Text',
  type: 'object',
  icon: TextIcon,
  groups: sectionGroups,
  fields: [
    defineField({ name: 'heading', type: 'string', group: 'content' }),
    richTextField('body', { group: 'content', required: true }),
    defineField({
      name: 'width',
      type: 'string',
      group: 'settings',
      initialValue: 'narrow',
      options: { list: ['narrow', 'wide'], layout: 'radio', direction: 'horizontal' },
    }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: 'heading' },
    prepare: ({ title }) => ({ title: title || 'Untitled text', subtitle: 'Text' }),
  },
})
