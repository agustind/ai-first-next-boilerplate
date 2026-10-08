---
name: frontend-conventions
description: UI conventions — design tokens, Tailwind v4, shared components, images, accessibility, server/client boundaries, view transitions and React Compiler. Use when building or styling components, sections or pages.
---

# Frontend conventions

## Styling

- Tailwind v4, configured in CSS: `features/style/globals.css`. **Design tokens live in `@theme`** (`--color-bg`, `fg`, `muted`, `muted-fg`, `border`, `accent`, `accent-fg`, `danger`, `success`, `--radius-card`, `--container-content`, `--container-prose`). Rebrand by editing tokens, not components. Dark mode follows the OS.
- Use token utilities (`bg-bg`, `text-muted-fg`, `border-border`, `rounded-card`, `max-w-content`). No raw hex colours in components.
- Section tone (`default | muted | inverted`) is applied by `SectionFrame` via `.tone-*` classes that redefine the tokens, so sections need no tone-specific styles.
- Merge classes with `cn()` (`features/style/cn.ts`). Fonts: Geist via `next/font` (`features/style/fonts.ts`).

## Components (`components/`)

`Container` (content/prose widths), `Button`/`ButtonLink` (`buttonClasses`), `SmartLink` (internal → `next/link`, external → new tab), `CmsImage` (CDN loader for Sanity/Directus, blur placeholder, hotspot), `JsonLd`, `SubmitButton`. Reuse before adding; put feature-specific UI inside the feature folder.

## Server / client

- Server Components by default. Add `'use client'` only on the smallest interactive leaf; pass serializable props.
- React Compiler is on (`reactCompiler: true`): don't hand-write `useMemo`/`useCallback` for performance; keep render pure (no `Date.now()`/`Math.random()` in render; use effects or server data).
- Never import `server-only` modules (CMS adapters, env secrets) into client components. Public env vars are `NEXT_PUBLIC_*` via `env.ts`.

## Images

`<CmsImage image={…} sizes="…" />` always with a real `sizes`. First-fold images: `preload` (Next 16 replaces `priority`). Decorative: `alt=""`.

## Accessibility (non-negotiable)

Semantic landmarks (header/nav/main/footer exist in the layout; skip link included), one `h1` per page, visible focus (global `:focus-visible`), labels for inputs, `aria-live`/`role="alert"` for async feedback, colour contrast from tokens, `prefers-reduced-motion` respected.

## Motion

- Route transitions: React `<ViewTransition>` wraps page content in the `(web)` layout; shared-element morphs use matching `name` + `share="morph" default="none"` (see blog cards ↔ post hero). Read `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`.
- Prefer CSS transitions; reduced-motion users get none (globals.css).

## Activity / preserved state

With Cache Components, navigations keep previous routes mounted but hidden (`<Activity>`). Effects clean up on hide; reset ephemeral UI (open menus/dialogs) on navigation.
