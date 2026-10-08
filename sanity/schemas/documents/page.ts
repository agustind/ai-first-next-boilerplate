import { DocumentIcon } from '@sanity/icons/Document'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { RESERVED_SLUGS } from '../../constants'
import { sectionSchemas } from '../sections'

export const pageType = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      description:
        'URL path without leading slash. Use "index" for the home page, "services/web" for nested pages.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) =>
        rule.required().custom((slug) => {
          const value = slug?.current
          if (!value) return true
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(value)) {
            return 'Lowercase letters, numbers and dashes; separate levels with /'
          }
          if (RESERVED_SLUGS.includes(value.split('/')[0] ?? ''))
            return `"${value}" is reserved by the app`
          return true
        }),
    }),
    defineField({
      name: 'sections',
      type: 'array',
      group: 'content',
      of: sectionSchemas.map((schema) => defineArrayMember({ type: schema.name })),
      options: {
        insertMenu: { filter: true, views: [{ name: 'list' }] },
      },
    }),
    defineField({ name: 'seo', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({ title, subtitle: slug === 'index' ? '/' : `/${slug ?? ''}` }),
  },
})
