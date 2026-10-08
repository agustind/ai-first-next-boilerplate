---
name: trim-features
description: Safely remove features the project doesn't need (Directus, Sanity, demo, blog, forms, public MCP, analytics, view transitions…). Use when asked to slim down, remove or disable a feature.
---

# Trim features

Delete code, don't just hide it. After each removal: `npm run check` (knip finds leftovers) and `npm run build`.

| Remove | Delete | Then fix |
| --- | --- | --- |
| **Directus** | `features/cms/directus/`, every section `directus.ts`, `directus/`, `scripts/directus-bootstrap.ts`, `@directus/sdk`, `turndown` (+ `@types/turndown`) if no HTML rich text remains | `features/cms/index.ts`, `env.ts` (`DIRECTUS_*`, enum), `registry.test.ts` (Directus assertions), `app/api/revalidate/route.ts` (default tag), package.json scripts, `.env.example`, docs |
| **Sanity** | `sanity/`, `sanity.config.ts`, `sanity.cli.ts`, `app/studio/`, `features/cms/sanity/`, section `schema.ts` + `query.ts`, `features/page-builder/queries.ts`, `scripts/seed-sanity.ts`, deps `sanity next-sanity @sanity/* styled-components` | `features/cms/index.ts`, `env.ts`, `features/draft-mode/*` (cookie perspective, SanityLive), `primitives.ts` (`stegaClean` → identity), `next.config.ts` (`cacheLife` import), registry test, `app/global-not-found.tsx` + `experimental.globalNotFound` can go if only one root layout remains |
| **Demo provider** | keep it — CI builds with it. Only remove if CI has CMS credentials. | |
| **Blog** | `app/(web)/blog/`, `features/blog/`, `app/feed.xml/`, post/author/category schemas & queries, `getPost`/`listPosts` from `ContentSource` and adapters | sitemap `/blog` entry, llms.txt, markdown `/blog`, navigation, OpenAPI feed path |
| **Forms** | `features/forms/`, `contact-form-section`, `app/api/forms/`, `formSubmission` schema, `submitForm` in adapters | OpenAPI, registries |
| **Public MCP** | `app/api/mcp/`, `features/agents/mcp-server.ts`, `PUBLIC_MCP_ENABLED` | OpenAPI, llms.txt text, robots `AGENT_ALLOWED_PATHS` |
| **Analytics** | `features/analytics/`, `<Umami />` in layout, env vars | |
| **View transitions** | `<ViewTransition>` wrappers in layout/blog, CSS in globals.css | |
| **Basic auth** | `features/auth/`, the block in `proxy.ts`, `SITE_*` env | |

Keep the agent docs honest: update `AGENTS.md`, `README.md` and any skill that mentions the removed feature in the same change (`docs-maintenance` rule in AGENTS.md).
