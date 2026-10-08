import type { HeroSectionModel } from './model'

export function heroSectionToMarkdown(section: HeroSectionModel) {
  return [
    section.eyebrow ? `_${section.eyebrow}_` : '',
    `# ${section.heading}`,
    section.text ?? '',
    section.actions.map((action) => `- [${action.label}](${action.href})`).join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')
}
