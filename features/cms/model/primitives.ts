import { stegaClean } from '@sanity/client/stega'
import { z } from 'zod'

/**
 * Building blocks for the content contract. Every CMS adapter must produce data
 * that parses against these schemas; components only ever see the parsed output.
 */

const clean = (value: unknown) => (typeof value === 'string' ? stegaClean(value) : value)

/**
 * A string compared or used programmatically (enum, href, slug). In Sanity draft
 * mode strings carry invisible stega markers for click-to-edit; strip them first.
 */
export const cleanString = z.preprocess(clean, z.string())

export const cleanEnum = <const T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess(clean, z.enum(values))

/** Treat `null` (Sanity/Directus "unset") as `undefined` so `.optional()` works. */
export const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === null ? undefined : value), schema.optional())

/** Arrays that may come back as `null` from the CMS. */
export const list = <T extends z.ZodType>(schema: T) =>
  z
    .array(schema)
    .nullish()
    .transform((value) => value ?? [])

/** A field with a fallback when the CMS returns `null`/nothing. Input stays optional. */
export const withDefault = <T extends z.ZodType>(schema: T, fallback: z.output<T>) =>
  schema.nullish().transform((value) => (value ?? fallback) as z.output<T>)

export const imageSchema = z.object({
  /** Absolute CDN URL or a path under /public. */
  src: cleanString,
  alt: z.string().default(''),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Tiny base64 placeholder (Sanity LQIP). */
  blurDataURL: optional(z.string()),
  /** Focal point, 0–1 on each axis, used as `object-position`. */
  hotspot: optional(z.object({ x: z.number(), y: z.number() })),
})
export type Image = z.infer<typeof imageSchema>

export const linkSchema = z.object({
  label: z.string(),
  /** Internal path (`/about`) or absolute URL. Internal references are resolved by the adapter. */
  href: cleanString,
})

/** A Portable Text-like node. Kept structural so the model stays CMS-agnostic. */
export type RichTextNode = { _type: string; _key?: string; [key: string]: unknown }

export const richTextSchema = z.discriminatedUnion('format', [
  z.object({
    format: z.literal('portable-text'),
    blocks: list(z.looseObject({ _type: z.string() })).transform(
      (blocks) => blocks as RichTextNode[],
    ),
  }),
  z.object({ format: z.literal('html'), html: z.string() }),
])
export type RichText = z.infer<typeof richTextSchema>

export const seoSchema = z.object({
  title: optional(z.string()),
  description: optional(z.string()),
  image: optional(imageSchema),
  noIndex: withDefault(z.boolean(), false),
})
export type Seo = z.infer<typeof seoSchema>

export const uriSchema = cleanString.refine((uri) => uri.startsWith('/'), 'uri must start with "/"')
