import type { MediaSectionModel } from './model'

export function mediaSectionToMarkdown(section: MediaSectionModel) {
  return [
    `![${section.image.alt}](${section.image.src})`,
    section.caption ? `_${section.caption}_` : '',
  ]
    .filter(Boolean)
    .join('\n')
}
