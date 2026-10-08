import type { RouteEntry, Settings } from '@/features/cms/model'

/**
 * llms.txt (https://llmstxt.org): a Markdown map of the site for LLMs, linking
 * to the Markdown version of each page.
 */
export function buildLlmsTxt({
  settings,
  routes,
  siteUrl,
}: {
  settings: Settings
  routes: RouteEntry[]
  siteUrl: string
}) {
  const md = (uri: string) => `${siteUrl}${uri === '/' ? '/index' : uri}.md`
  const indexable = routes.filter((route) => !route.noIndex)
  const pages = indexable.filter((route) => route.type === 'page')
  const posts = indexable.filter((route) => route.type === 'post')

  const list = (entries: RouteEntry[]) =>
    entries.map((entry) => `- [${entry.title}](${md(entry.uri)})`).join('\n')

  return [
    `# ${settings.siteName}`,
    settings.description ? `> ${settings.description}` : '',
    [
      'Every page is available as Markdown: append `.md` to its URL or send `Accept: text/markdown`.',
      `Machine-readable API: ${siteUrl}/openapi.json. MCP server (streamable HTTP): ${siteUrl}/api/mcp.`,
    ].join(' '),
    pages.length ? `## Pages\n\n${list(pages)}` : '',
    posts.length ? `## Blog\n\n${list(posts)}` : '',
    `## Optional\n\n- [RSS feed](${siteUrl}/feed.xml)\n- [Sitemap](${siteUrl}/sitemap.xml)`,
  ]
    .filter(Boolean)
    .join('\n\n')
}
