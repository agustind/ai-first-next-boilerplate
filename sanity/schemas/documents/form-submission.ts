import { InboxIcon } from '@sanity/icons/Inbox'
import { defineArrayMember, defineField, defineType } from 'sanity'

/** Written by the site (SANITY_API_WRITE_TOKEN), read-only in the Studio. */
export const formSubmissionType = defineType({
  name: 'formSubmission',
  title: 'Form submission',
  type: 'document',
  icon: InboxIcon,
  readOnly: true,
  fields: [
    defineField({ name: 'form', type: 'string' }),
    defineField({ name: 'page', type: 'string' }),
    defineField({ name: 'submittedAt', type: 'datetime' }),
    defineField({
      name: 'fields',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'field',
          fields: [
            defineField({ name: 'name', type: 'string' }),
            defineField({ name: 'value', type: 'text' }),
          ],
          preview: { select: { title: 'name', subtitle: 'value' } },
        }),
      ],
    }),
  ],
  orderings: [
    { title: 'Newest', name: 'newest', by: [{ field: 'submittedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { form: 'form', submittedAt: 'submittedAt', fields: 'fields' },
    prepare: ({ form, submittedAt, fields }) => {
      const email = (fields as { name: string; value: string }[] | undefined)?.find(
        (f) => f.name === 'email',
      )
      return { title: email?.value ?? form, subtitle: `${form} · ${submittedAt ?? ''}` }
    },
  },
})
