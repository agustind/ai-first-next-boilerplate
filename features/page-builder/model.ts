import { z } from 'zod'
import { contactFormSectionModel } from './sections/contact-form-section/model'
import { ctaSectionModel } from './sections/cta-section/model'
import { faqSectionModel } from './sections/faq-section/model'
import { featureGridSectionModel } from './sections/feature-grid-section/model'
import { heroSectionModel } from './sections/hero-section/model'
import { mediaSectionModel } from './sections/media-section/model'
import { textSectionModel } from './sections/text-section/model'
// plop:model-imports

/** Every section the page builder understands. Order is irrelevant here. */
export const sectionSchema = z.discriminatedUnion('type', [
  heroSectionModel,
  textSectionModel,
  mediaSectionModel,
  ctaSectionModel,
  faqSectionModel,
  featureGridSectionModel,
  contactFormSectionModel,
  // plop:model-entries
])

export type Section = z.infer<typeof sectionSchema>
export type SectionType = Section['type']

export type SectionIssue = { index: number; type: string; key?: string; issues: string[] }

/**
 * Validate sections one by one. A broken section is dropped and reported
 * instead of taking the whole page down.
 */
export function parseSections(raw: unknown[]): { sections: Section[]; issues: SectionIssue[] } {
  const sections: Section[] = []
  const issues: SectionIssue[] = []
  raw.forEach((value, index) => {
    const result = sectionSchema.safeParse(value)
    if (result.success) {
      sections.push(result.data)
      return
    }
    const record = (value ?? {}) as { type?: unknown; key?: unknown }
    issues.push({
      index,
      type: String(record.type ?? 'unknown'),
      key: typeof record.key === 'string' ? record.key : undefined,
      issues: result.error.issues.map(
        (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
      ),
    })
  })
  return { sections, issues }
}
