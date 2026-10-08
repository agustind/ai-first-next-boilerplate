---
name: cms-adapters
description: Switch between Sanity, Directus and the demo provider, set up Directus, or add a new CMS adapter. Use when configuring the CMS for a new project or changing features/cms/*/adapter.ts.
---

# CMS adapters

`getContentSource()` (`features/cms/index.ts`) returns the adapter for `CMS_PROVIDER`, or infers it: Sanity project id → `sanity`; `DIRECTUS_URL` → `directus`; otherwise `demo` (built-in content in `features/cms/demo/content.ts`, which needs no credentials and is used by CI).

| | Sanity (default) | Directus | Demo |
| --- | --- | --- | --- |
| Editor UI | Embedded Studio `/studio` | Directus app | — |
| Live updates | `<SanityLive>` (automatic) | Directus Flow → `POST /api/revalidate` | — |
| Visual editing | Presentation tool + stega | draft mode only (`/api/draft-mode/enable?secret=…`) | — |
| Schema as code | `sanity/schemas` + section `schema.ts` | `collections.ts` + section `directus.ts` → `npm run directus:bootstrap` | — |
| Rich text | Portable Text | HTML (WYSIWYG) → `{ format: 'html' }` | Portable Text |

## Sanity setup

```bash
npx sanity@latest init --env .env.local   # create/link project, writes NEXT_PUBLIC_SANITY_* vars
# tokens (sanity.io/manage → API → Tokens): Viewer → SANITY_API_READ_TOKEN, Editor → SANITY_API_WRITE_TOKEN
# CORS origin with credentials: http://localhost:3000 and your production URL
npm run sanity:seed                        # optional: demo content into the dataset
```

## Directus setup

```bash
npm run directus:up          # docker compose, http://localhost:8055
npm run directus:bootstrap   # collections, fields, M2A page builder, public read permissions
```

Create a static token for a read user → `DIRECTUS_URL`, `DIRECTUS_TOKEN`; set `REVALIDATE_SECRET` and add a Flow (event hook on items create/update/delete → webhook `POST {site}/api/revalidate`, header `Authorization: Bearer <secret>`). See `directus/README.md`.

## Add another CMS

1. `features/cms/<name>/adapter.ts` implementing `ContentSource`; return data through `toPage`/`toPost`/… (`parse.ts`).
2. Cache published reads in a `'use cache'` function with `cacheTag('<name>')`; skip cache when `ctx.draft`.
3. Per-section mapping: follow the Directus pattern (a spec per section + generic mapper) and extend `registry.test.ts` so the new registry can't drift.
4. Register it in `features/cms/index.ts` and the `CMS_PROVIDER` enum in `env.ts`.
5. Write mapper tests with recorded fixtures.

## Remove a CMS you don't use

Use the `trim-features` skill.
