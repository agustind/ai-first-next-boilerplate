import type { CtaSectionModel } from './model'

export function ctaSectionToMarkdown(section: CtaSectionModel) {
  return [
    `## ${section.heading}`,
    section.text ?? '',
    section.actions.map((action) => `- [${action.label}](${action.href})`).join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')
}
