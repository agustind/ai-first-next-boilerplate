import type { ContactFormSectionModel } from './model'

export function contactFormSectionToMarkdown(section: ContactFormSectionModel) {
  return [
    section.heading ? `## ${section.heading}` : '',
    section.text ?? '',
    'Agents can submit this form with `POST /api/forms/contact` (JSON: `name`, `email`, `message`). See /openapi.json.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
