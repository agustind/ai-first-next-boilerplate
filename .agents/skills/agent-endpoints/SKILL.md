---
name: agent-endpoints
description: The site's agent-facing surface in production — Markdown twins, llms.txt, robots AI-crawler policy, OpenAPI, the public MCP server at /api/mcp and the contact API. Use when changing what agents can read or do on the live site.
---

# Agent-ready in production

| Surface | Where | Notes |
| --- | --- | --- |
| Markdown twin of every page | `proxy.ts` → `app/api/agent-markdown/[[...uri]]/route.ts` → `features/agents/markdown.ts` | `/about.md`, `/index.md`, or `Accept: text/markdown`. Each section contributes via its `toMarkdown`. Links are absolutized. Pages advertise it with `<link rel="alternate" type="text/markdown">` (`buildMetadata`). |
| llms.txt | `app/llms.txt/route.ts`, `features/agents/llms-txt.ts` | Static, revalidated with content. Lists indexable pages/posts → `.md` links. |
| robots.txt | `app/robots.ts`, `features/agents/ai-crawlers.ts` | Non-production deployments disallow everything. Answer/search agents always allowed; training crawlers per `AI_TRAINING_CRAWLERS`. |
| OpenAPI | `app/openapi.json/route.ts`, `features/agents/openapi.ts` | Describes the endpoints below. Request schemas come from the Zod contracts (`z.toJSONSchema`). |
| Public MCP | `app/api/mcp/route.ts`, `features/agents/mcp-server.ts` | Stateless streamable HTTP via `@modelcontextprotocol/server` (v2). Read-only tools: `get_site_info`, `list_pages`, `get_page`, `search`. Toggle with `PUBLIC_MCP_ENABLED`. |
| Contact API | `app/api/forms/contact/route.ts` | JSON POST, same pipeline as the form (see `forms` skill), rate-limited. |
| Structured data | `features/seo/structured-data.ts`, section `jsonLd` | WebSite/Organization, BlogPosting, BreadcrumbList, FAQPage. |

## Add a public MCP tool

1. `server.registerTool(name, { title, description, inputSchema: z.object({...}), annotations: { readOnlyHint: true } }, handler)` in `features/agents/mcp-server.ts`. Descriptions are prompts for other agents: say what it returns and when to use it.
2. Only expose published content (`PUBLISHED` context, never draft). Keep tools read-only unless there's an explicit product decision; writes need auth and rate limiting.
3. Document it in `features/agents/openapi.ts` (the `/api/mcp` summary) and `llms-txt.ts` if relevant.
4. Verify with `site-check` → `check_agent_readiness`, or `curl -X POST /api/mcp` with `Accept: application/json, text/event-stream`.

## Rules

- Markdown output must stand alone: headings, absolute links, frontmatter with title/url/updated.
- Never expose drafts, form submissions or tokens through agent endpoints.
- Agent endpoints are part of the public contract: when you rename routes or fields, update OpenAPI and llms.txt in the same change.
