import { defineSection } from '../../define'
import { contactFormSectionToMarkdown } from './markdown'
import { contactFormSectionModel } from './model'
import { contactFormSectionSample } from './sample'
import { ContactFormSection } from './section'

export const contactFormSection = defineSection({
  type: 'contactFormSection',
  title: 'Contact form',
  description:
    'Name, email and message form with spam protection. Submissions are stored in the CMS.',
  model: contactFormSectionModel,
  component: ContactFormSection,
  sample: contactFormSectionSample,
  toMarkdown: contactFormSectionToMarkdown,
})
