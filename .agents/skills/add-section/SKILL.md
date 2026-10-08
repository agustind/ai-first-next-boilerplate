---
name: add-section
description: Create, change or remove a page-builder section (hero, FAQ, CTA…). Use whenever a task touches features/page-builder/sections, adds a block editors can place on a page, or changes a section's fields.
---

# Add or change a page-builder section

A section is **one folder** under `features/page-builder/sections/<name>-section/`. Every layer lives there:

| File | Role | Loaded by |
| --- | --- | --- |
| `model.ts` | Zod schema = the content contract. `type: z.literal('<camel>Section')`, spreads `sectionBase` | everything |
| `section.tsx` | React Server Component. Props: `SectionProps<Model>` (`section`, `index`) | frontend registry |
| `sample.ts` | Realistic sample (`satisfies z.input<typeof model>`) | demo CMS, `/section-preview`, tests |
| `markdown.ts` | `toMarkdown(section)` for agents (+ optional `jsonLd`) | agent endpoints, MCP |
| `query.ts` | GROQ projection into the model shape | Sanity adapter |
| `schema.ts` | Sanity `defineType` (editor UI) | Studio only |
| `directus.ts` | Directus field spec (schema-as-code) | Directus adapter + bootstrap |
| `index.ts` | `defineSection({...})` wiring model/component/sample/markdown | frontend registry |

Four registries list sections; **`registry.test.ts` fails if they drift**:
`features/page-builder/model.ts` (union), `registry.ts` (frontend), `queries.ts` (GROQ), `sanity/schemas/sections.ts`, `features/cms/directus/sections.ts`.

## Create

```bash
npm run new:section            # prompts for a name, e.g. "testimonial"
```

Plop scaffolds the folder from `templates/section/` and registers it in all registries (inserted above the `// plop:*` markers — never delete those markers). Then:

1. Design the **model first** (`model.ts`). Use primitives from `@/features/cms/model/primitives`: `optional()`, `list()`, `withDefault()`, `cleanEnum()` (stega-safe enums), `imageSchema`, `linkSchema`, `richTextSchema`.
2. Mirror every model field in `schema.ts` (Sanity), `query.ts` (GROQ, reuse `image()`, `links()`, `richText()` from `@/features/cms/sanity/groq`) and `directus.ts`. The contract test checks field names exist in both CMS specs.
3. Write `sample.ts` with realistic copy (it is the demo content and the visual test fixture).
4. Build `section.tsx` (see the `frontend-conventions` skill). Use `headingTag(index)` so the first section owns the page `h1`. Images: `<CmsImage preload={index === 0} sizes=…>`.
5. `toMarkdown` must convey the content to an agent; add `jsonLd` if schema.org has a matching type.

## Verify

```bash
npm test -- registry        # contract + sample + markdown tests
npm run typecheck
```

Then open `/section-preview/<type>` (dev server) and check it visually and with the `site-check` MCP `audit_page` tool. The section preview index is `/section-preview`.

## Change a field

Change `model.ts` first, then follow the type errors and the contract test: `schema.ts` → `query.ts` → `directus.ts` → `sample.ts` → `section.tsx` → `markdown.ts`. Existing CMS content may not have the new field: make it `optional()`/`withDefault()` or migrate content (Sanity: `sanity-migration` skill / `npx sanity migration`; Directus: re-run `npm run directus:bootstrap`, it is idempotent for new fields).

## Remove

Delete the folder and its entry + import in the five registries (search for the type name). Run `npm test` and `npm run knip`. Existing documents containing the section are dropped at render time (logged as section issues), so also clean up content.

## Rules

- Never read raw CMS data in a component. Components only receive parsed model objects.
- A section that fails validation is dropped and reported (`data-section-error`), never crashes the page. Don't paper over model mismatches with `z.any()`.
- Keep sections server components; isolate interactivity in a small `'use client'` child.
