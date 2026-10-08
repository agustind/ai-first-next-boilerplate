import { parseSections } from '@/features/page-builder/model'
import {
  type Page,
  type Post,
  type PostSummary,
  pageSchema,
  postSchema,
  postSummarySchema,
  type Redirect,
  type RouteEntry,
  redirectSchema,
  routeEntrySchema,
  type Settings,
  settingsSchema,
} from './model'

/**
 * Validation boundary between adapters and the app. Adapters hand raw,
 * already-projected data to these functions and get typed models back.
 */

export const DEFAULT_SETTINGS: Settings = {
  siteName: 'New Site',
  description: '',
  navigation: [],
  footer: { links: [] },
  social: [],
}

function report(scope: string, detail: unknown) {
  console.warn(`[cms] ${scope} failed validation`, detail)
}

export function toSettings(raw: unknown): Settings {
  if (!raw) return DEFAULT_SETTINGS
  const result = settingsSchema.safeParse(raw)
  if (!result.success) {
    report('settings', result.error.issues)
    return DEFAULT_SETTINGS
  }
  return result.data
}

export function toPage(raw: unknown): Page | null {
  if (!raw) return null
  const result = pageSchema.safeParse(raw)
  if (!result.success) {
    report('page', result.error.issues)
    return null
  }
  const { sections, issues } = parseSections(result.data.sections)
  if (issues.length > 0) report(`sections on ${result.data.uri}`, issues)
  return { ...result.data, sections, sectionIssues: issues }
}

export function toPost(raw: unknown): Post | null {
  if (!raw) return null
  const result = postSchema.safeParse(raw)
  if (!result.success) {
    report('post', result.error.issues)
    return null
  }
  return result.data
}

/** Lists drop invalid entries instead of failing the whole list. */
function parseList<T>(
  scope: string,
  raw: unknown,
  parse: (item: unknown) => { success: boolean; data?: T; error?: unknown },
) {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((item) => {
    const result = parse(item)
    if (result.success) return [result.data as T]
    report(scope, result.error)
    return []
  })
}

export const toPostSummaries = (raw: unknown): PostSummary[] =>
  parseList('post summary', raw, (item) => postSummarySchema.safeParse(item))

export const toRoutes = (raw: unknown): RouteEntry[] =>
  parseList('route', raw, (item) => routeEntrySchema.safeParse(item))

export const toRedirects = (raw: unknown): Redirect[] =>
  parseList('redirect', raw, (item) => redirectSchema.safeParse(item))

/** `/` → `index`, `/about/team` → `about/team` (Sanity slug convention). */
export function uriToSlug(uri: string) {
  const trimmed = uri.replace(/^\/+|\/+$/g, '')
  return trimmed === '' ? 'index' : trimmed
}
