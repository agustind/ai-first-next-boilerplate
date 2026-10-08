import type { LivePerspective } from 'next-sanity/live'
import type { CmsProvider } from '@/env'
import type {
  FormSubmission,
  Page,
  Post,
  PostSummary,
  Redirect,
  RouteEntry,
  Settings,
} from './model'

/**
 * How content should be fetched. `PUBLISHED` is the cacheable default; draft
 * mode produces a draft context (Sanity adds perspective + stega for visual editing).
 */
export interface FetchContext {
  draft: boolean
  /** Sanity perspective: 'published', 'drafts' or a release stack. Ignored by other adapters. */
  perspective: LivePerspective
  /** Encode Sanity source maps into strings (click-to-edit). Draft only. */
  stega: boolean
  variant?: string
}

export const PUBLISHED: FetchContext = { draft: false, perspective: 'published', stega: false }

/**
 * The contract every CMS adapter implements. Adapters return validated model
 * objects (see ./parse.ts); the app never touches raw CMS documents.
 */
export interface ContentSource {
  readonly provider: CmsProvider
  getSettings(ctx?: FetchContext): Promise<Settings>
  /** `uri` is the full path, `/` for the home page. */
  getPage(uri: string, ctx?: FetchContext): Promise<Page | null>
  getPost(slug: string, ctx?: FetchContext): Promise<Post | null>
  listPosts(ctx?: FetchContext, options?: { limit?: number }): Promise<PostSummary[]>
  /** Every published, routable document. Drives static params, sitemap, llms.txt. */
  listRoutes(): Promise<RouteEntry[]>
  listRedirects(): Promise<Redirect[]>
  submitForm(submission: FormSubmission): Promise<void>
}
