# Architecture

## Content pipeline

```
            ┌────────────── features/cms/source.ts: ContentSource ───────────────┐
Sanity ──── sanity/adapter.ts   (GROQ projections, 'use cache' via defineLive)   │
Directus ── directus/adapter.ts (REST + spec-driven mapper, 'use cache' + tags)  │──► parse.ts (zod) ──► typed models
demo ────── demo/adapter.ts     (in-repo fixtures)                               │
            └─────────────────────────────────────────────────────────────────────┘
```

- **Content model** (`features/cms/model`, section `model.ts`): Zod schemas. The only shapes components, metadata and agent output ever see. Validation failures are logged and the item is dropped (a broken section never takes a page down; in draft mode it's shown as a warning box).
- **Adapters** project CMS data into the model. Sanity does it in GROQ (`features/cms/sanity/groq.ts` helpers, section `query.ts`); Directus uses per-section field specs (`directus.ts`) and a generic mapper; demo content is authored directly in model shape.
- **Provider selection**: `CMS_PROVIDER`, else inferred from env (`env.ts → resolveCmsProvider`).

## Page builder

`features/page-builder/sections/<name>-section/` contains everything for one section. Registries:

| Registry | Consumers |
| --- | --- |
| `page-builder/model.ts` — Zod discriminated union | parsing |
| `page-builder/registry.ts` — component, sample, markdown, JSON-LD | rendering, previews, agents |
| `page-builder/queries.ts` — GROQ projections | Sanity adapter |
| `sanity/schemas/sections.ts` — Studio types | Studio |
| `cms/directus/sections.ts` — Directus specs | Directus adapter + bootstrap |

They're separate so the Studio (`sanity` package) and the Directus SDK never end up in the site bundle. `registry.test.ts` asserts they list the same types and that every model field exists in both CMS schemas. Plop templates (`templates/section`) keep new sections consistent.

## Rendering & caching

- `cacheComponents: true`: data is dynamic unless cached. All CMS reads go through a `'use cache'` boundary inside the adapter, tagged per CMS.
- Sanity: `defineLive({ strict: true })`; `<SanityLive>` in the layout listens to the Live Content API and expires tags; `cacheLife` default is long (`next-sanity/live/cache-life`).
- Directus: tags `directus` / `directus:<collection>`; `POST /api/revalidate` expires them (Directus Flow).
- Draft mode: the page checks `isDraftMode()` first; the draft branch renders inside `<Suspense>` with a request-time `FetchContext` (perspective, stega). Published requests never touch cookies.
- `ensureStatic = 'navigation'` on CMS dynamic routes: URLs not prerendered at build wait for a full render, so `notFound()` → HTTP 404 and CMS redirects → HTTP 308/307 instead of a soft 404 in a streamed shell.
- Two root layouts (`app/(web)` and `app/studio`) → `app/global-not-found.tsx` handles unmatched URLs.
- Known framework behaviour (Next 16.4): a 404 rendered through Cache Components' prerender recovery returns the correct `404` status and `noindex`, but the HTML body is a minimal shell and the not-found UI is rendered client-side from the Flight payload. Search engines key off the status code; agents get a Markdown 404 from the `.md` endpoints.

## Request flow

`proxy.ts` → (basic auth if `SITE_PASSWORD`) → Markdown negotiation (`*.md` or `Accept: text/markdown` → `/api/agent-markdown/*`) → route.

## Agent surfaces

| Dev time | Production |
| --- | --- |
| `AGENTS.md`, `.agents/skills/*` | `/<path>.md`, `Accept: text/markdown` |
| `site-check` MCP (`scripts/mcp`) | `/llms.txt` |
| `next-devtools`, `chrome-devtools`, `sanity` MCPs | `/openapi.json` |
| Contract tests, `npm run check` | `/api/mcp` (read-only tools) |
| `/section-preview/*` | `/api/forms/contact` (JSON) |

## Security notes

- Secrets only via `env.ts`; tokens are server-only (`server-only` imports in adapters).
- Security headers in `next.config.ts` (`frame-ancestors` allows the embedded Studio and `*.sanity.studio`).
- Forms: server-side validation, honeypot, timing, optional Turnstile, rate limit on the JSON API.
- Rich text HTML from Directus is rendered as editor-trusted content; don't expose that field to untrusted input.
- Preview/staging deployments can be locked with basic auth; robots disallow non-production.
