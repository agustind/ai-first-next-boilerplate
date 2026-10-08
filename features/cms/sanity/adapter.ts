import 'server-only'
import { env, isProductionDeployment } from '@/env'
import {
  toPage,
  toPost,
  toPostSummaries,
  toRedirects,
  toRoutes,
  toSettings,
  uriToSlug,
} from '../parse'
import { type ContentSource, type FetchContext, PUBLISHED } from '../source'
import { getSanityWriteClient } from './client'
import { cachedSanityFetch } from './live'
import {
  PAGE_QUERY,
  POST_QUERY,
  POSTS_QUERY,
  REDIRECTS_QUERY,
  ROUTES_QUERY,
  SETTINGS_QUERY,
} from './queries'

function fetchWith(ctx: FetchContext, query: string, params?: Record<string, unknown>) {
  return cachedSanityFetch({
    query,
    params: params as never,
    perspective: ctx.perspective,
    stega: ctx.stega,
    variant: ctx.variant,
  })
}

export const sanitySource: ContentSource = {
  provider: 'sanity',
  async getSettings(ctx = PUBLISHED) {
    return toSettings(await fetchWith(ctx, SETTINGS_QUERY))
  },
  async getPage(uri, ctx = PUBLISHED) {
    return toPage(await fetchWith(ctx, PAGE_QUERY, { slug: uriToSlug(uri) }))
  },
  async getPost(slug, ctx = PUBLISHED) {
    return toPost(await fetchWith(ctx, POST_QUERY, { slug }))
  },
  async listPosts(ctx = PUBLISHED, { limit = 100 } = {}) {
    return toPostSummaries(await fetchWith(ctx, POSTS_QUERY, { limit }))
  },
  async listRoutes() {
    return toRoutes(await fetchWith(PUBLISHED, ROUTES_QUERY))
  },
  async listRedirects() {
    return toRedirects(await fetchWith(PUBLISHED, REDIRECTS_QUERY))
  },
  async submitForm(submission) {
    const client = getSanityWriteClient()
    if (!client) {
      const hasEmail = Boolean(env.RESEND_API_KEY && env.FORMS_NOTIFY_EMAIL)
      if (isProductionDeployment && !hasEmail) {
        throw new Error('SANITY_API_WRITE_TOKEN is not set and no email delivery is configured')
      }
      console.warn('[cms:sanity] SANITY_API_WRITE_TOKEN missing: submission not stored')
      return
    }
    await client.create({
      _type: 'formSubmission',
      form: submission.form,
      page: submission.page,
      submittedAt: submission.submittedAt,
      fields: Object.entries(submission.data).map(([name, value]) => ({
        _key: name,
        _type: 'field',
        name,
        value,
      })),
    })
  },
}
