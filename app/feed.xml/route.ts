import { buildRssFeed } from '@/features/blog/feed'
import { getContentSource } from '@/features/cms'
import { siteUrl } from '@/features/site/url'

export async function GET() {
  const cms = getContentSource()
  const [settings, posts] = await Promise.all([
    cms.getSettings(),
    cms.listPosts(undefined, { limit: 50 }),
  ])
  return new Response(buildRssFeed({ settings, posts, siteUrl }), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
