import type { z } from 'zod'
import type { contactFormSectionModel } from './model'

export const contactFormSectionSample = {
  type: 'contactFormSection',
  key: 'sample-contact',
  anchor: 'contact',
  heading: 'Get in touch',
  text: 'Tell us about your project. We usually reply within one business day.',
} satisfies z.input<typeof contactFormSectionModel>
