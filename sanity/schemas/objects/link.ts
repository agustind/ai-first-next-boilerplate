import { LinkIcon } from '@sanity/icons/Link'
import { defineField, defineType } from 'sanity'

export const linkType = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({ name: 'label', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'linkType',
      title: 'Type',
      type: 'string',
      initialValue: 'internal',
      options: { list: ['internal', 'external'], layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'internal',
      title: 'Page or post',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'post' }],
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'anchor',
      description: 'Optional section anchor on the target page, without #.',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'internal',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Absolute URL, or a path like /contact.',
      validation: (rule) =>
        rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
      hidden: ({ parent }) => parent?.linkType !== 'external',
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'url', ref: 'internal.slug.current' } },
})
