import { SECTION_BASE } from '@/features/cms/sanity/groq'
import { contactFormSectionQuery } from './sections/contact-form-section/query'
import { ctaSectionQuery } from './sections/cta-section/query'
import { faqSectionQuery } from './sections/faq-section/query'
import { featureGridSectionQuery } from './sections/feature-grid-section/query'
import { heroSectionQuery } from './sections/hero-section/query'
import { mediaSectionQuery } from './sections/media-section/query'
import { textSectionQuery } from './sections/text-section/query'
// plop:query-imports

/** GROQ projection per section type (Sanity adapter only). */
export const sectionQueries: Record<string, string> = {
  heroSection: heroSectionQuery,
  textSection: textSectionQuery,
  mediaSection: mediaSectionQuery,
  ctaSection: ctaSectionQuery,
  faqSection: faqSectionQuery,
  featureGridSection: featureGridSectionQuery,
  contactFormSection: contactFormSectionQuery,
  // plop:query-entries
}

/** `sections[]{ ...base, _type == "x" => { ... } }` for every registered section. */
export function sectionsProjection(field = 'sections') {
  const branches = Object.entries(sectionQueries)
    .map(([type, projection]) => `_type == "${type}" => { ${projection} }`)
    .join(',\n')
  return `"sections": ${field}[]{ ${SECTION_BASE}, ${branches} }`
}
