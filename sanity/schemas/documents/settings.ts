import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { imageField } from '../fields'

const links = (name: string, title?: string) =>
  defineField({ name, title, type: 'array', of: [defineArrayMember({ type: 'link' })] })

export const settingsType = defineType({
  name: 'settings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({ name: 'siteName', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      description: 'Default meta description and llms.txt summary.',
    }),
    links('navigation'),
    defineField({ name: 'footerText', type: 'string' }),
    links('footerLinks', 'Footer links'),
    links('social', 'Social links'),
    imageField('ogImage', { title: 'Default social image', description: '1200×630.' }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
