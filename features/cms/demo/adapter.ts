import { toPage, toPost, toPostSummaries, toRedirects, toRoutes, toSettings } from '../parse'
import type { ContentSource } from '../source'
import { demoPages, demoPosts, demoRedirects, demoSettings } from './content'

export const demoSource: ContentSource = {
  provider: 'demo',
  async getSettings() {
    return toSettings(demoSettings)
  },
  async getPage(uri) {
    return toPage(demoPages.find((page) => page.uri === uri))
  },
  async getPost(slug) {
    return toPost(demoPosts.find((post) => post.slug === slug))
  },
  async listPosts(_ctx, { limit = 100 } = {}) {
    const sorted = [...demoPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    return toPostSummaries(sorted.slice(0, limit))
  },
  async listRoutes() {
    return toRoutes([
      ...demoPages.map((page) => ({
        uri: page.uri,
        title: page.title,
        type: 'page',
        updatedAt: page.updatedAt,
      })),
      ...demoPosts.map((post) => ({
        uri: `/blog/${post.slug}`,
        title: post.title,
        type: 'post',
        updatedAt: post.updatedAt,
      })),
    ])
  },
  async listRedirects() {
    return toRedirects(demoRedirects)
  },
  async submitForm(submission) {
    console.info(
      '[cms:demo] form submission (not stored, configure a CMS):',
      submission.form,
      submission.data.email,
    )
  },
}
