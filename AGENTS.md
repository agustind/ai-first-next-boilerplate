# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot…) working in this repo. Humans: start with README.md.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## What this is

A boilerplate for content-driven websites: **Next.js 16** (App Router, Cache Components, React 19.3, React Compiler, Tailwind 4) + a headless CMS behind an adapter (**Sanity** by default, **Directus** optional, **demo** content when nothing is configured). Projects are cloned from it, renamed and shipped.

## Commands

```bash
npm run dev            # dev server (reuse a running one: see .next/dev/lock)
npm run check          # lint + typecheck + tests + knip — must pass before you finish
npm run build          # production build (demo content if no CMS env)
npm run new:section    # scaffold a page-builder section across all layers
npm run sanity:extract # refresh sanity-schema.json after Sanity schema changes
npm test -- <pattern>  # vitest
```

## Map

```
app/(web)/              site routes (own root layout): [[...uri]] CMS pages, blog, section-preview
app/studio/             embedded Sanity Studio (own root layout)
app/api/                agent-markdown, mcp, forms, draft-mode, revalidate, og
app/{robots,sitemap,manifest}.ts, llms.txt/, feed.xml/, openapi.json/
proxy.ts                basic auth (staging) + Markdown content negotiation
features/cms/           content model (zod), ContentSource adapters: sanity/ directus/ demo/
features/page-builder/  sections/<name>-section/* + registries + renderer
features/agents/        markdown, llms.txt, robots policy, OpenAPI, public MCP server
features/{seo,forms,blog,rich-text,redirects,draft-mode,site,style,auth,analytics}/
components/             shared UI primitives
sanity/                 Studio schemas, structure, presentation config
scripts/                init, seed, Directus bootstrap, site-check MCP server, git hooks
.agents/skills/         skills (symlinked into .claude/skills)
```

## Golden rules

1. **Schema as a system.** Content flows CMS → adapter → Zod model → components. Components never see raw CMS data. A section's model, CMS schemas, query, component, sample and Markdown live in one folder and four registries are kept in sync by `registry.test.ts`. Skills: `add-section`, `content-model`.
2. **Static by default.** Published pages are prerendered; `<SanityLive>`/tags keep them fresh. Runtime data (`draftMode`, `cookies`) is read outside `'use cache'` and only on the draft path. CMS dynamic routes keep `ensureStatic = 'navigation'` so 404s/redirects return real status codes. Skill: `sanity-live-cache`.
3. **Agent-ready output.** Every page has a Markdown twin, is listed in llms.txt and readable through `/api/mcp`. When you add content types or routes, keep these surfaces, the sitemap and OpenAPI in sync. Skills: `agent-endpoints`, `seo-aeo`.
4. **Verify, don't assume.** Run `npm run check`; for UI/routing changes use the `site-check` and `next-devtools` MCP servers and `/section-preview`. Report what you ran. Skill: `verify-work`.
5. **Accessible, token-driven UI.** Server Components by default, design tokens from `features/style/globals.css`, one `h1`, labelled inputs. Skill: `frontend-conventions`.
6. **No secrets in code; env via `env.ts`.** Document every new variable in `.env.example`.
7. **Commits:** Conventional Commits, and never add AI attribution (`Co-Authored-By` for an AI tool, "Generated with…"). The commit-msg hook rejects it. Skill: `conventional-commits`.

## MCP servers (`.mcp.json`)

- `site-check` (local, this repo): `run_checks`, `audit_page`, `crawl_site`, `check_agent_readiness`, `list_sections`. Default target `http://localhost:3000`; pass `baseUrl` for other ports/deployments.
- `next-devtools`: running dev server's errors, routes, compilation issues, bundled docs.
- `chrome-devtools`: real browser — screenshots, console, network, performance traces.
- `sanity`: content and schema operations on the Sanity project (OAuth on first use).

## Skills

Project: `add-section`, `content-model`, `sanity-live-cache`, `cms-adapters`, `agent-endpoints`, `seo-aeo`, `forms`, `frontend-conventions`, `verify-work`, `new-project`, `trim-features`, `conventional-commits`.
Next.js: `next-dev-loop`, `next-cache-components-optimizer`, `next-bundle-optimizer`. Sanity: `sanity-best-practices`, `content-modeling-best-practices`, `seo-aeo-best-practices`, `portable-text-serialization`.
Engineering workflow (Matt Pocock): `grill-me`, `grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `implement-spec`, `tdd`, `diagnosing-bugs`, `code-review`, `pr`, `improve-codebase-architecture`, `codebase-design`, `domain-modeling`, `research`, `prototype`, `triage`, `handoff`, `retro`, … (`.agents/skills/`). Update third-party skills with `npx skills update` (pinned in `skills-lock.json`).

## Docs maintenance

When behaviour changes, update the matching skill, this file and README.md in the same change. Stale agent docs are bugs.
