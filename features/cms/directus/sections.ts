import { contactFormSectionDirectus } from '@/features/page-builder/sections/contact-form-section/directus'
import { ctaSectionDirectus } from '@/features/page-builder/sections/cta-section/directus'
import { faqSectionDirectus } from '@/features/page-builder/sections/faq-section/directus'
import { featureGridSectionDirectus } from '@/features/page-builder/sections/feature-grid-section/directus'
import { heroSectionDirectus } from '@/features/page-builder/sections/hero-section/directus'
import { mediaSectionDirectus } from '@/features/page-builder/sections/media-section/directus'
import { textSectionDirectus } from '@/features/page-builder/sections/text-section/directus'
// plop:directus-imports
import type { DirectusSectionSpec } from './spec'

/** Directus collection spec per section type. Kept in sync by registry.test.ts. */
export const directusSections: DirectusSectionSpec[] = [
  heroSectionDirectus,
  textSectionDirectus,
  mediaSectionDirectus,
  ctaSectionDirectus,
  faqSectionDirectus,
  featureGridSectionDirectus,
  contactFormSectionDirectus,
  // plop:directus-entries
]
