import { McpServer } from '@modelcontextprotocol/server'
import { z } from 'zod'
import { checkAgentReadiness } from './tools/agent-readiness'
import { auditPage } from './tools/audit-page'
import { crawlSite } from './tools/crawl-site'
import { listSections } from './tools/list-sections'
import { CHECKS, runChecks } from './tools/run-checks'

const text = (value: string, isError = false) => ({
  content: [{ type: 'text' as const, text: value }],
  isError,
})
const baseUrl = z
  .string()
  .url()
  .optional()
  .describe('Site to test. Defaults to SITE_CHECK_URL or http://localhost:3000 (npm run dev).')

/**
 * "site-check": lets a coding agent verify its own work against the running
 * site and the repo's quality gates. Local only (stdio), see .mcp.json.
 */
export function createSiteCheckServer() {
  const server = new McpServer({ name: 'site-check', version: '1.0.0' })

  server.registerTool(
    'run_checks',
    {
      title: 'Run quality gates',
      description:
        'Run lint (Biome), typecheck (tsc), tests (Vitest) and/or knip in the repo. Returns pass/fail and the failing output.',
      inputSchema: z.object({
        checks: z.array(z.enum(CHECKS)).optional().describe('Defaults to all four.'),
      }),
    },
    async ({ checks }) => {
      const result = await runChecks({ checks })
      return text(result.text, !result.passed)
    },
  )

  server.registerTool(
    'audit_page',
    {
      title: 'Audit a page',
      description:
        'SEO, accessibility and agent-readiness audit of one rendered page: title, description, canonical, Open Graph, h1/heading order, image alt, link text, JSON-LD, noindex, Markdown twin, and CMS sections that failed validation.',
      inputSchema: z.object({
        path: z.string().describe('Path such as "/" or "/blog/hello".'),
        baseUrl,
      }),
      annotations: { readOnlyHint: true },
    },
    async (input) => text(await auditPage(input)),
  )

  server.registerTool(
    'crawl_site',
    {
      title: 'Crawl the site',
      description:
        'Fetch every URL in /sitemap.xml: status codes, broken internal links, missing/duplicate titles, missing descriptions, failed CMS sections.',
      inputSchema: z.object({ baseUrl, limit: z.number().int().min(1).max(500).default(50) }),
      annotations: { readOnlyHint: true },
    },
    async (input) => text(await crawlSite(input)),
  )

  server.registerTool(
    'check_agent_readiness',
    {
      title: 'Check agent endpoints',
      description:
        'Verify llms.txt, robots.txt, sitemap.xml, feed.xml, openapi.json, Markdown content negotiation and the public MCP endpoint (/api/mcp).',
      inputSchema: z.object({ baseUrl }),
      annotations: { readOnlyHint: true },
    },
    async (input) => text(await checkAgentReadiness(input)),
  )

  server.registerTool(
    'list_sections',
    {
      title: 'List page-builder sections',
      description:
        'Every page-builder section type with its folder and /section-preview URL (renders the section with sample content).',
      inputSchema: z.object({ baseUrl }),
      annotations: { readOnlyHint: true },
    },
    async (input) => text(await listSections(input)),
  )

  return server
}
