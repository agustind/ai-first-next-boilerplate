---
name: verify-work
description: How to prove a change works before calling it done — quality gates, the site-check MCP server, Next.js dev MCP, section previews and browser checks. Use after every non-trivial edit and before reporting a task as complete.
---

# Verify your work

Don't report "done" from reading code. Run the loop that matches the change, show the evidence.

## 1. Static gates (always)

```bash
npm run check        # biome lint + typecheck (with route types) + vitest + knip
```

or the `site-check` MCP tool `run_checks` (`checks: ["lint","typecheck","test","knip"]`). Fix failures; don't silence rules or skip tests.

## 2. Runtime (UI, routes, data)

Start the dev server once (`npm run dev`; if `.next/dev/lock` says one is running, reuse it). Then:

| Question | Tool |
| --- | --- |
| Does it compile / any runtime or build errors? | `next-devtools` MCP → `nextjs_index`, then `nextjs_call` `get_errors`, `get_compilation_issues`, `compile_route` |
| Is the page healthy for SEO/a11y/agents? | `site-check` → `audit_page { path: "/about" }` |
| Did I break any page or link? | `site-check` → `crawl_site` (reads the sitemap, checks status codes, broken internal links, invalid sections) |
| Are llms.txt, robots, sitemap, feed, OpenAPI, Markdown and /api/mcp OK? | `site-check` → `check_agent_readiness` |
| Does a section look right? | open `/section-preview/<type>` (index at `/section-preview`); `site-check` → `list_sections` |
| What does it look like / console errors? | `chrome-devtools` MCP (navigate, screenshot, console) or the `next-dev-loop` skill (agent-browser) |

`site-check` defaults to `http://localhost:3000`; pass `baseUrl` or set `SITE_CHECK_URL` for another port or a deployed URL.

## 3. Production behaviour (routing, caching, status codes)

Dev mode doesn't prerender. For changes to caching, routing, redirects, 404s or metadata:

```bash
npm run build && npm run start -- -p 3100
# then audit/crawl with baseUrl http://localhost:3100
curl -sI http://localhost:3100/some-missing-page   # expect 404, not 200
```

The build output lists each route as ○ static / ◐ partial / ƒ dynamic: published CMS pages must stay ○.

## 4. Content changes

Sections that fail validation are dropped and marked with `data-section-error` (visible in draft mode). `crawl_site` and `audit_page` report them. Server logs show `[cms] … failed validation` with the exact Zod issue.

## Report

State what you ran and what it returned (commands, tool results, URLs checked). If something could not be verified (e.g. no CMS credentials), say so explicitly.
