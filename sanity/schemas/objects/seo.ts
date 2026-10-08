import { defineField, defineType } from 'sanity'
import { imageField } from '../fields'

export const seoType = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'title',
      description: 'Overrides the document title in search results. ~50–60 characters.',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Long titles get truncated in search results'),
    }),
    defineField({
      name: 'description',
      description: 'Shown in search results and link previews. ~120–160 characters.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(170).warning('Long descriptions get truncated'),
    }),
    imageField('image', { title: 'Social image', description: '1200×630 recommended.' }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
