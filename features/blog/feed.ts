import type { PostSummary, Settings } from '@/features/cms/model'

export function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (char) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": 'apos', '"': 'quot' }[char]};`,
  )
}

/** RSS 2.0 for the blog. */
export function buildRssFeed({
  settings,
  posts,
  siteUrl,
}: {
  settings: Settings
  posts: PostSummary[]
  siteUrl: string
}) {
  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`
      return [
        '<item>',
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
        post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : '',
        ...post.categories.map((category) => `<category>${escapeXml(category.title)}</category>`),
        '</item>',
      ].join('')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(settings.siteName)}</title>
<link>${siteUrl}/blog</link>
<description>${escapeXml(settings.description || settings.siteName)}</description>
<language>en</language>
<atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`
}
