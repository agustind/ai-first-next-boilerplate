import { ImageIcon } from '@sanity/icons/Image'
import { defineField, defineType } from 'sanity'
import { imageField, sectionGroups, sectionSettingsFields } from '@/sanity/schemas/fields'

export const mediaSectionSchema = defineType({
  name: 'mediaSection',
  title: 'Media',
  type: 'object',
  icon: ImageIcon,
  groups: sectionGroups,
  fields: [
    imageField('image', { group: 'content', required: true }),
    defineField({ name: 'caption', type: 'string', group: 'content' }),
    defineField({
      name: 'size',
      type: 'string',
      group: 'settings',
      initialValue: 'contained',
      options: { list: ['contained', 'full'], layout: 'radio', direction: 'horizontal' },
    }),
    ...sectionSettingsFields,
  ],
  preview: {
    select: { title: 'caption', alt: 'image.alt', media: 'image' },
    prepare: ({ title, alt, media }) => ({
      title: title || alt || 'Image',
      subtitle: 'Media',
      media,
    }),
  },
})
