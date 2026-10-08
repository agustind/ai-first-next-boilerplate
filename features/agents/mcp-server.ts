import 'server-only'
import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import { getContentSource } from '@/features/cms'
import { absoluteUrl, markdownPath, siteUrl } from '@/features/site/url'
import { documentToMarkdown } from './markdown'

const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] })

/**
 * Public, read-only MCP server served at /api/mcp. Lets AI assistants browse
 * and search the site's published content without scraping HTML.
 */
export function createPublicMcpServer() {
  const server = new McpServer({ name: 'site', version: '1.0.0' })
  const cms = getContentSource()

  server.registerTool(
    'get_site_info',
    {
      title: 'Site info',
      description: 'Name, description, navigation and machine-readable endpoints of this website.',
      annotations: { readOnlyHint: true },
    },
    async () => {
      const settings = await cms.getSettings()
      return text(
        JSON.stringify(
          {
            name: settings.siteName,
            description: settings.description,
            url: siteUrl,
            navigation: settings.navigation.map((link) => ({
              label: link.label,
              url: absoluteUrl(link.href),
            })),
            endpoints: {
              llmsTxt: absoluteUrl('/llms.txt'),
              openApi: absoluteUrl('/openapi.json'),
              feed: absoluteUrl('/feed.xml'),
            },
          },
          null,
          2,
        ),
      )
    },
  )

  server.registerTool(
    'list_pages',
    {
      title: 'List pages',
      description: 'Every published page and blog post with its URI, title and last update.',
      inputSchema: z.object({ type: z.enum(['page', 'post', 'all']).default('all') }),
      annotations: { readOnlyHint: true },
    },
    async ({ type }) => {
      const routes = (await cms.listRoutes()).filter(
        (route) => !route.noIndex && (type === 'all' || route.type === type),
      )
      return text(
        routes
          .map(
            (route) =>
              `- ${route.title} — ${route.uri} (${route.type}, updated ${route.updatedAt})`,
          )
          .join('\n') || 'No pages published yet.',
      )
    },
  )

  server.registerTool(
    'get_page',
    {
      title: 'Get page',
      description:
        'Full content of a page or post as Markdown. `uri` is a path such as "/" or "/blog/hello".',
      inputSchema: z.object({ uri: z.string().startsWith('/') }),
      annotations: { readOnlyHint: true },
    },
    async ({ uri }) => {
      const markdown = await documentToMarkdown(uri)
      return markdown ? text(markdown) : { ...text(`Nothing published at ${uri}`), isError: true }
    },
  )

  server.registerTool(
    'search',
    {
      title: 'Search',
      description:
        'Case-insensitive full-text search across published pages and posts. Returns matching URIs with a snippet.',
      inputSchema: z.object({
        query: z.string().min(2),
        limit: z.number().int().min(1).max(20).default(5),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ query, limit }) => {
      const needle = query.toLowerCase()
      const routes = (await cms.listRoutes()).filter((route) => !route.noIndex).slice(0, 100)
      const hits: string[] = []
      for (const route of routes) {
        if (hits.length >= limit) break
        const markdown = (await documentToMarkdown(route.uri)) ?? ''
        const position = markdown.toLowerCase().indexOf(needle)
        if (position === -1 && !route.title.toLowerCase().includes(needle)) continue
        const start = Math.max(0, position - 80)
        const snippet =
          position === -1 ? '' : markdown.slice(start, position + 160).replace(/\s+/g, ' ')
        hits.push(
          `- ${route.title} (${route.uri}) → ${absoluteUrl(markdownPath(route.uri))}\n  …${snippet}…`,
        )
      }
      return text(hits.join('\n') || `No results for "${query}".`)
    },
  )

  return server
}
