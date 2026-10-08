import type { SectionDefinition } from './define'
import type { Section, SectionType } from './model'
import { contactFormSection } from './sections/contact-form-section'
import { ctaSection } from './sections/cta-section'
import { faqSection } from './sections/faq-section'
import { featureGridSection } from './sections/feature-grid-section'
import { heroSection } from './sections/hero-section'
import { mediaSection } from './sections/media-section'
import { textSection } from './sections/text-section'

// plop:registry-imports

type Registry = { [T in SectionType]: SectionDefinition<Extract<Section, { type: T }>> }

/**
 * Frontend section registry: component, sample, markdown, JSON-LD per type.
 * Studio schemas live in sanity/schemas/sections.ts, GROQ in ./queries.ts and
 * Directus specs in features/cms/directus/sections.ts. registry.test.ts keeps
 * all four in sync.
 */
export const sectionRegistry: Registry = {
  heroSection,
  textSection,
  mediaSection,
  ctaSection,
  faqSection,
  featureGridSection,
  contactFormSection,
  // plop:registry-entries
}

export const sectionDefinitions = Object.values(sectionRegistry) as SectionDefinition<Section>[]

export function getSectionDefinition<T extends SectionType>(type: T) {
  return sectionRegistry[type] as SectionDefinition<Extract<Section, { type: T }>>
}
