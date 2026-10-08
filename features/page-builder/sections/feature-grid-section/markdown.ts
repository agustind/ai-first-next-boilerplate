import type { FeatureGridSectionModel } from './model'

export function featureGridSectionToMarkdown(section: FeatureGridSectionModel) {
  return [
    section.heading ? `## ${section.heading}` : '',
    section.intro ?? '',
    section.items.map((item) => `- **${item.title}**: ${item.text}`).join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')
}
