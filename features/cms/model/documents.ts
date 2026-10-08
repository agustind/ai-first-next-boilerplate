import { z } from 'zod'
import type { Section, SectionIssue } from '@/features/page-builder/model'
import {
  cleanString,
  imageSchema,
  linkSchema,
  list,
  optional,
  richTextSchema,
  seoSchema,
  uriSchema,
  withDefault,
} from './primitives'

export const pageSchema = z.object({
  id: z.string(),
  title: z.string(),
  uri: uriSchema,
  seo: withDefault(seoSchema, { noIndex: false }),
  /** Invalid sections are dropped (and reported) by `parseSections`, never thrown. */
  sections: list(z.unknown()),
  updatedAt: z.string(),
})
export type Page = Omit<z.infer<typeof pageSchema>, 'sections'> & {
  sections: Section[]
  /** Sections dropped by validation. Surfaced in preview, logged in production. */
  sectionIssues: SectionIssue[]
}

export const categorySchema = z.object({ title: z.string(), slug: cleanString })

export const authorSchema = z.object({
  name: z.string(),
  role: optional(z.string()),
  image: optional(imageSchema),
})

export const postSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: cleanString,
  excerpt: optional(z.string()),
  image: optional(imageSchema),
  publishedAt: z.string(),
  updatedAt: z.string(),
  author: optional(authorSchema),
  categories: list(categorySchema),
})
export type PostSummary = z.infer<typeof postSummarySchema>

export const postSchema = postSummarySchema.extend({
  body: richTextSchema,
  seo: seoSchema,
})
export type Post = z.infer<typeof postSchema>

export const settingsSchema = z.object({
  siteName: z.string(),
  description: z.string().default(''),
  navigation: list(linkSchema),
  footer: z.object({
    text: optional(z.string()),
    links: list(linkSchema),
  }),
  social: list(linkSchema),
  ogImage: optional(imageSchema),
})
export type Settings = z.infer<typeof settingsSchema>

export const redirectSchema = z.object({
  source: cleanString,
  destination: cleanString,
  permanent: withDefault(z.boolean(), true),
})
export type Redirect = z.infer<typeof redirectSchema>

export const routeEntrySchema = z.object({
  uri: uriSchema,
  title: z.string(),
  type: z.enum(['page', 'post']),
  updatedAt: z.string(),
  noIndex: withDefault(z.boolean(), false),
})
export type RouteEntry = z.infer<typeof routeEntrySchema>

export const formSubmissionSchema = z.object({
  form: z.string(),
  data: z.record(z.string(), z.string()),
  page: optional(z.string()),
  submittedAt: z.string(),
})
export type FormSubmission = z.infer<typeof formSubmissionSchema>
