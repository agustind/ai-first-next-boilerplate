---
name: seo-aeo
description: SEO and answer-engine optimisation conventions for this codebase — metadata, canonical URLs, social images, structured data, sitemap, redirects and status codes. Use when adding routes, changing metadata, or auditing search/AI visibility. For general principles see the seo-aeo-best-practices skill.
---

# SEO & AEO here

## Every routable page

- `generateMetadata` → `buildMetadata()` (`features/seo/metadata.ts`): title (layout template adds the site name), description fallback chain (seo → excerpt → site description), canonical, Open Graph/Twitter (CMS image or the generated `/api/og` card), `robots` from `seo.noIndex`, and the `text/markdown` alternate.
- Exactly one `h1` (first section via `headingTag(index)`, or the page/post title).
- Structured data with `<JsonLd>` (`components/json-ld.tsx` escapes `<`): breadcrumbs on non-home pages, BlogPosting on posts, FAQPage from FAQ sections, WebSite/Organization in the layout.
- Images: alt text is required by the Sanity schema (warning) and rendered from the CMS; decorative images pass `alt=""` explicitly.

## Site-wide

- `app/sitemap.ts` — from `listRoutes()`, skips `noIndex`. Add new static routes here (e.g. `/blog` is appended).
- `app/robots.ts` — production only indexable; previews/staging are `Disallow: /` (based on `VERCEL_ENV`, else `NODE_ENV`). Set `NEXT_PUBLIC_SITE_URL` per environment.
- Redirects — editors manage them in the CMS; `redirectOrNotFound()` applies them on content misses with real 308/307 status. Code-level permanent redirects belong in `next.config.ts` `redirects()`.
- Status codes — CMS dynamic routes export `ensureStatic = 'navigation'` so missing content is a real 404 (see `sanity-live-cache` skill). Check with `curl -sI`.

## AEO (answer engines)

- Write sections so their Markdown reads well alone (`toMarkdown`). Agents get it at `/<path>.md`.
- Prefer explicit Q&A (FAQ section → FAQPage), clear headings, short summaries (`excerpt`, `seo.description`).
- Keep `llms.txt` meaningful: site description in settings, descriptive page titles.
- AI answer bots are always allowed in robots; decide training crawlers with `AI_TRAINING_CRAWLERS`.

## Verify

`site-check` MCP: `audit_page` for a page, `crawl_site` for the whole site (duplicate titles, missing descriptions, broken links), `check_agent_readiness` for robots/sitemap/llms/feed/OpenAPI/MCP.
