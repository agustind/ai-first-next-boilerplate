import { z } from 'zod'
import { contactInputSchema } from '@/features/forms/contact'

/** OpenAPI 3.1 description of everything an agent can do with this site. */
export function buildOpenApi({ siteUrl, siteName }: { siteUrl: string; siteName: string }) {
  const markdown = { 'text/markdown': { schema: { type: 'string' } } }
  return {
    openapi: '3.1.0',
    info: {
      title: `${siteName} agent API`,
      version: '1.0.0',
      description:
        'Read this site as Markdown, discover content via llms.txt, query it over MCP, and send contact requests.',
    },
    servers: [{ url: siteUrl }],
    paths: {
      '/llms.txt': {
        get: {
          operationId: 'getLlmsTxt',
          summary: 'Markdown index of the site (llms.txt convention)',
          responses: {
            '200': {
              description: 'Site map for LLMs',
              content: { 'text/plain': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/{path}.md': {
        get: {
          operationId: 'getPageMarkdown',
          summary:
            'Any page as Markdown. Use `index.md` for the home page. Equivalent to GET /{path} with `Accept: text/markdown`.',
          parameters: [
            {
              name: 'path',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'blog/hello-world',
            },
          ],
          responses: {
            '200': { description: 'Page content', content: markdown },
            '404': { description: 'No page at this path' },
          },
        },
      },
      '/api/forms/contact': {
        post: {
          operationId: 'submitContact',
          summary:
            'Send a message to the site owner on behalf of a person. Only with their consent.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: z.toJSONSchema(contactInputSchema) } },
          },
          responses: {
            '201': { description: 'Accepted' },
            '422': { description: 'Validation failed; `fieldErrors` explains which fields' },
            '429': { description: 'Too many requests; retry later' },
          },
        },
      },
      '/api/mcp': {
        post: {
          operationId: 'mcp',
          summary:
            'Model Context Protocol endpoint (streamable HTTP). Tools: get_site_info, list_pages, get_page, search.',
          responses: { '200': { description: 'JSON-RPC response' } },
        },
      },
      '/feed.xml': {
        get: {
          operationId: 'getFeed',
          summary: 'RSS 2.0 feed of blog posts',
          responses: {
            '200': {
              description: 'RSS',
              content: { 'application/rss+xml': { schema: { type: 'string' } } },
            },
          },
        },
      },
    },
  }
}
