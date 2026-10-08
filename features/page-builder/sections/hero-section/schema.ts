import { RocketIcon } from '@sanity/icons/Rocket'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { imageField, sectionGroups, sectionSettingsFields } from '@/sanity/schemas/fields'

export const heroSectionSchema = defineType({
  name: 'heroSection',
  title: 'Hero',
  type: 'object',
  icon: RocketIcon,
  groups: sectionGroups,
  fields: [
    defineField({ name: 'eyebrow', type: 'string', group: 'content' }),
    defineField({
      name: 'heading',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({ name: 'text', type: 'text', rows: 3, group: 'content' }),
    imageField('image', { group: 'content' }),
    defineField({
      name: 'actions',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'link' })],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: 'layout',
      type: 'string',
      group: 'settings',
      initialValue: 'centered',
      options: { list: ['centered', 'split'], layout: 'radio', direction: 'horizontal' },
    }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: 'heading', media: 'image' },
    prepare: ({ title, media }) => ({ title, subtitle: 'Hero', media }),
  },
})
