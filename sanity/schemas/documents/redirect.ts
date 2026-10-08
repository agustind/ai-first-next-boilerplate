import { ArrowRightIcon } from '@sanity/icons/ArrowRight'
import { defineField, defineType } from 'sanity'

export const redirectType = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  icon: ArrowRightIcon,
  description: 'Checked when a URL has no content, before showing a 404.',
  fields: [
    defineField({
      name: 'source',
      type: 'string',
      description: 'Old path, e.g. /old-page. End with /* to match everything below it.',
      validation: (rule) =>
        rule.required().custom((value) => (value?.startsWith('/') ? true : 'Must start with /')),
    }),
    defineField({
      name: 'destination',
      type: 'string',
      description: 'New path or full URL. A * receives what the source wildcard matched.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'permanent',
      type: 'boolean',
      description: 'Permanent (308) tells search engines to update their index. Temporary is 307.',
      initialValue: true,
    }),
  ],
  preview: {
    select: { source: 'source', destination: 'destination', permanent: 'permanent' },
    prepare: ({ source, destination, permanent }) => ({
      title: `${source} → ${destination}`,
      subtitle: permanent ? 'Permanent' : 'Temporary',
    }),
  },
})
