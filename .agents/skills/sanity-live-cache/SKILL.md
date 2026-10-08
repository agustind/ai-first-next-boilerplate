---
name: sanity-live-cache
description: Sanity + Next.js 16 Cache Components patterns used here (defineLive strict mode, the single 'use cache' boundary, draft mode, visual editing, status codes). Use when touching data fetching, draft mode, page.tsx files under app/(web), or anything that errors with "uncached data", "runtime data" or "blocking route".
---

# Sanity Live × Cache Components

Read the version-matched Next docs first: `node_modules/next/dist/docs/01-app/` (caching, `use-cache`, `ensureStatic`, `streaming.md` "The HTTP contract").

## How fetching works

- `features/cms/sanity/live.ts` — `defineLive({ strict: true })` and **the only `'use cache'` boundary for Sanity**: `cachedSanityFetch()`. `sanityFetch` adds cache tags and `cacheLife`; `<SanityLive>` (in `features/draft-mode/live.tsx`, rendered by the `(web)` layout) expires tags when content changes. Published pages are static and still update within seconds.
- `cacheLife: { default: sanity }` in `next.config.ts` makes cached entries long-lived; freshness is event-driven.
- Runtime data (`draftMode()`, `cookies()`) is read **outside** the cache boundary by `getFetchContext()` (`features/draft-mode/context.ts`) and passed down as a `FetchContext`. Never call `cookies()`/`headers()` inside `'use cache'`.

## Page pattern (copy this)

```tsx
export const ensureStatic = 'navigation' // real 404/308 for unlisted params

export default async function Page(props: PageProps<'/x/[slug]'>) {
  if (await isDraftMode()) {
    return <Suspense><DraftX params={props.params} /></Suspense>   // dynamic, request-time
  }
  return <X slug={(await props.params).slug} ctx={PUBLISHED} />    // static
}
async function DraftX({ params }) {
  return <X slug={(await params).slug} ctx={await getFetchContext()} />
}
async function X({ slug, ctx }) {
  const doc = await getContentSource().getX(slug, ctx)
  if (!doc) return redirectOrNotFound(`/x/${slug}`)   // CMS redirects, then 404
  …
}
```

- `generateStaticParams` must return **at least one** param (Cache Components rule) — fall back to a placeholder.
- `ensureStatic = 'navigation'` makes the first request for an unlisted URL wait for the complete render. Without it Next serves the streamed App Shell with `200`, and `notFound()`/`redirect()` degrade to a soft 404 and a client redirect. Keep it on every CMS-driven dynamic route.
- Don't use `dynamicParams`, `revalidate` or `dynamic` segment configs: they are incompatible with Cache Components.

## Draft mode & visual editing

- Presentation tool (Studio → Presentation) enables draft mode through `/api/draft-mode/enable` (`defineEnableDraftMode`). Needs `SANITY_API_READ_TOKEN` (Viewer).
- Draft context = `perspective` from the Presentation cookie (drafts or a release), `stega: true` (click-to-edit overlays), `<VisualEditing>` + `<SanityLive includeDrafts>`.
- Stega strings must be cleaned before comparisons: the content model does this via `cleanString`/`cleanEnum`.

## Studio

- Embedded at `/studio` (`app/studio`, its own root layout; `app/global-not-found.tsx` exists because there are two root layouts).
- `@sanity/icons` v5: import each icon from its subpath (`import { UserIcon } from '@sanity/icons/User'`). The root export is typed but `never` at runtime; Biome blocks root imports.
- Singletons: `settings` with id `siteSettings` (`sanity/constants.ts`, `sanity/structure.ts`).
- After schema changes: `npm run sanity:extract` → `sanity-schema.json` (used by agents and the Sanity MCP). Deploy schema for AI features/MCP with `npx sanity schema deploy`.

## Debugging

- "Uncached data was accessed outside of `<Suspense>`": you called the CMS without going through the adapter, or added `fetch` outside `'use cache'`.
- "Runtime data … ensureStatic": `cookies()`/`headers()`/`searchParams` reached the published path. Move it behind `isDraftMode()` or into the draft branch.
- Content not updating locally: `<SanityLive>` needs the browser to allow the Sanity CORS origin (`http://localhost:3000`, add in sanity.io/manage → API → CORS, with credentials).
