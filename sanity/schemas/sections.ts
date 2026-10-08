import { contactFormSectionSchema } from '@/features/page-builder/sections/contact-form-section/schema'
import { ctaSectionSchema } from '@/features/page-builder/sections/cta-section/schema'
import { faqSectionSchema } from '@/features/page-builder/sections/faq-section/schema'
import { featureGridSectionSchema } from '@/features/page-builder/sections/feature-grid-section/schema'
import { heroSectionSchema } from '@/features/page-builder/sections/hero-section/schema'
import { mediaSectionSchema } from '@/features/page-builder/sections/media-section/schema'
import { textSectionSchema } from '@/features/page-builder/sections/text-section/schema'
// plop:schema-imports

/** Studio schema per section type. Kept in sync with the frontend registry by registry.test.ts. */
export const sectionSchemas = [
  heroSectionSchema,
  textSectionSchema,
  mediaSectionSchema,
  ctaSectionSchema,
  faqSectionSchema,
  featureGridSectionSchema,
  contactFormSectionSchema,
  // plop:schema-entries
]
