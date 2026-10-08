import { ImageIcon } from '@sanity/icons/Image'
import { defineArrayMember, defineField } from 'sanity'

/** Image with required alt text (unless marked decorative) and hotspot. */
export function imageField(
  name: string,
  options: { title?: string; description?: string; required?: boolean; group?: string } = {},
) {
  return defineField({
    name,
    title: options.title,
    description: options.description,
    group: options.group,
    type: 'image',
    options: { hotspot: true },
    validation: options.required ? (rule) => rule.required() : undefined,
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative text',
        description:
          'Describe the image for screen readers and search. Leave empty only if decorative.',
        type: 'string',
        validation: (rule) =>
          rule.custom((alt, context) => {
            const parent = context.parent as { asset?: unknown } | undefined
            if (parent?.asset && !alt) return { message: 'Add alt text', level: 'warning' } as never
            return true
          }),
      }),
    ],
  })
}

/** Portable Text with headings, lists, links and inline images. */
export function richTextField(
  name: string,
  options: { title?: string; group?: string; required?: boolean } = {},
) {
  return defineField({
    name,
    title: options.title,
    group: options.group,
    type: 'array',
    validation: options.required ? (rule) => rule.required() : undefined,
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'Heading 2', value: 'h2' },
          { title: 'Heading 3', value: 'h3' },
          { title: 'Heading 4', value: 'h4' },
          { title: 'Quote', value: 'blockquote' },
        ],
        marks: {
          annotations: [defineArrayMember({ name: 'link', type: 'link' })],
        },
      }),
      defineArrayMember({
        type: 'image',
        icon: ImageIcon,
        options: { hotspot: true },
        fields: [
          defineField({ name: 'alt', title: 'Alternative text', type: 'string' }),
          defineField({ name: 'caption', type: 'string' }),
        ],
      }),
    ],
  })
}

/** Shared section settings (see features/page-builder/define.ts `sectionBase`). */
export const sectionSettingsFields = [
  defineField({
    name: 'anchor',
    description: 'Lets links target this section (#anchor). Lowercase, dashes.',
    type: 'string',
    group: 'settings',
    validation: (rule) =>
      rule.regex(/^[a-z0-9-]+$/, { name: 'anchor' }).error('Lowercase letters, numbers and dashes'),
  }),
  defineField({
    name: 'tone',
    type: 'string',
    group: 'settings',
    initialValue: 'default',
    options: { list: ['default', 'muted', 'inverted'], layout: 'radio', direction: 'horizontal' },
  }),
]

export const sectionGroups = [
  { name: 'content', title: 'Content', default: true },
  { name: 'settings', title: 'Settings' },
]
