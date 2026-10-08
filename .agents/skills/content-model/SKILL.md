---
name: content-model
description: How content flows from the CMS to React (schema as a system) and how to add or change document fields (pages, posts, settings). Use before editing features/cms, sanity/schemas, GROQ queries or Directus specs.
---

# Content model (schema as a system)

```
CMS (Sanity | Directus | demo)
   │  adapter projects raw data into the model shape
   ▼
features/cms/parse.ts  ── zod validation (features/cms/model + page-builder/model)
   ▼
typed models (Page, Post, Settings, Section…) ──► components, metadata, markdown, MCP
```

- **The Zod model is the source of truth for the frontend.** `features/cms/model/documents.ts` (documents), `features/cms/model/primitives.ts` (image, link, rich text, seo), section models in their folders.
- **Each CMS has its own editor schema** that must be able to produce the model: Sanity `sanity/schemas/**` + section `schema.ts`; Directus `features/cms/directus/collections.ts` + section `directus.ts`.
- **Adapters** (`features/cms/{sanity,directus,demo}/adapter.ts`) implement `ContentSource` (`features/cms/source.ts`). They return only parsed models via `toPage`/`toPost`/… in `parse.ts`.
- `getContentSource()` picks the adapter from `CMS_PROVIDER` or the available credentials (`env.ts`).

## Add a field to a document (example: `subtitle` on posts)

1. Model: add `subtitle: optional(z.string())` to `postSummarySchema` / `postSchema`.
2. Sanity: add the field in `sanity/schemas/documents/post.ts`; project it in `features/cms/sanity/queries.ts`.
3. Directus: add `{ field: 'subtitle', kind: 'string' }` in `features/cms/directus/collections.ts`, map it in `features/cms/directus/adapter.ts` (`mapPostSummary`), run `npm run directus:bootstrap`.
4. Demo: add it to `features/cms/demo/content.ts`.
5. Use it in components / `buildMetadata` / `postToMarkdown`.
6. `npm run check`. If you use Sanity, regenerate `sanity-schema.json` with `npm run sanity:extract` (agents and the Sanity MCP read it).

## Rules

- Never pass raw CMS documents to components; never import adapter internals outside `features/cms`.
- Strings compared in code (enums, hrefs, slugs) must use `cleanString`/`cleanEnum`: in Sanity draft mode strings carry invisible stega characters.
- `null` from a CMS means "unset": use `optional()`, `list()` and `withDefault()`, which accept `null`.
- Validation failures are logged (`[cms] … failed validation`) and the item is dropped. Read the log before "fixing" a component.
- Internal links are resolved to hrefs by the adapter (GROQ `uri()` helper), not in components.
- Reserved page slugs (`sanity/constants.ts`): `blog`, `api`, `studio`, `section-preview`… extend the list when you add an app route.
