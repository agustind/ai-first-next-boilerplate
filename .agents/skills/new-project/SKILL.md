---
name: new-project
description: Turn a fresh clone of this boilerplate into a new client/site project and ship it — rename, connect CMS, seed, brand, deploy. Use at the very start of a project or when asked to "set up", "bootstrap" or "launch" the site.
---

# New project: clone → rename → ship

The step-by-step human guide (CMS dashboards, tokens, CORS, Vercel, DNS, launch checklist) is README.md sections 1–9. Keep it and this skill in sync.

1. **Rename** — `npm run init` (asks project name, site name, production URL; updates package.json, demo site name, creates `.env.local`). Re-init git history if the clone kept the boilerplate's: `rm -rf .git && git init`.
2. **Run it** — `npm install && npm run dev` → demo content at http://localhost:3000.
3. **Choose the CMS** (`cms-adapters` skill). Sanity: `npx sanity@latest init --env .env.local`, add tokens + CORS, `npm run sanity:seed`, open `/studio`.
4. **Brand** — tokens in `features/style/globals.css`, fonts in `features/style/fonts.ts`, `app/icon.svg`, site settings in the CMS (name, description, navigation, social, default social image).
5. **Trim** what the project doesn't need (`trim-features` skill). Run `npm run knip` afterwards.
6. **Content model** — add sections/fields the design needs (`add-section`, `content-model` skills).
7. **Deploy (Vercel)** — import the repo; set env vars from `.env.example` for Production and Preview (`NEXT_PUBLIC_SITE_URL` per environment, Sanity tokens, `REVALIDATE_SECRET`, optional `SITE_PASSWORD` for previews). Add the production URL to Sanity CORS and to the Presentation tool if the Studio is hosted elsewhere.
8. **Launch checklist**
   - `npm run check` and `npm run build` pass; CI green.
   - `site-check`: `crawl_site` and `check_agent_readiness` against the production URL (`baseUrl`) — no errors.
   - robots allows indexing in production only; sitemap submitted in Search Console.
   - Redirects from the old site entered in the CMS (`Redirects`), spot-checked with `curl -sI` (expect 308).
   - Forms deliver (submission visible in CMS / email received).
   - Analytics (`NEXT_PUBLIC_UMAMI_*`) if wanted.
