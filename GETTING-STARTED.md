# Getting started

From clone to production. Each step is also an agent skill (`.agents/skills/new-project`), so you can ask your agent to do it.

## 1. Create the project

```bash
git clone <this repo> my-site && cd my-site
rm -rf .git && git init
nvm use && npm install
npm run init
npm run dev
```

You now have the demo site at http://localhost:3000. Everything works without a CMS: pages, blog, forms (logged to the console), Markdown, llms.txt, MCP.

## 2. Connect Sanity (recommended)

```bash
npx sanity@latest init --env .env.local
```

Create a project (or pick one) and a dataset. Then in [sanity.io/manage](https://www.sanity.io/manage):

1. **API → Tokens**: create a *Viewer* token → `SANITY_API_READ_TOKEN` (draft mode, visual editing) and an *Editor* token → `SANITY_API_WRITE_TOKEN` (form submissions, seeding).
2. **API → CORS origins**: add `http://localhost:3000` and your production URL, **with credentials allowed**.

```bash
npm run sanity:seed      # optional: copy the demo content into your dataset
npm run dev              # Studio at http://localhost:3000/studio
```

Open **Presentation** in the Studio for live preview with click-to-edit. Published changes appear on the site within seconds (Sanity Live), with no rebuilds.

## 2b. Or connect Directus

```bash
npm run directus:up          # Docker, http://localhost:8055 (see directus/README.md)
npm run directus:bootstrap   # creates collections, fields, the page builder and public read access
```

Set `DIRECTUS_URL`, `DIRECTUS_TOKEN` and `REVALIDATE_SECRET` in `.env.local`, then add a Directus Flow that calls `POST /api/revalidate` on content changes (details in `directus/README.md`).

## 3. Make it yours

- **Brand**: design tokens in `features/style/globals.css`, fonts in `features/style/fonts.ts`, `app/icon.svg`.
- **Settings** in the CMS: site name, description (also used by llms.txt), navigation, footer, social links, default social image.
- **Sections**: `npm run new:section` (see `.agents/skills/add-section`).
- **Trim** features you don't need (`.agents/skills/trim-features`), then `npm run knip`.

## 4. Deploy (Vercel)

1. Import the repository.
2. Add the environment variables from `.env.example` for **Production** and **Preview**. Set `NEXT_PUBLIC_SITE_URL` to each environment's URL. Optionally set `SITE_PASSWORD` on Preview to keep staging private.
3. Add the production URL to Sanity CORS.

Robots only allow indexing on the production deployment (`VERCEL_ENV=production`).

## 5. Before launch

- `npm run check && npm run build` pass, CI is green.
- Ask your agent to run `site-check` → `crawl_site` and `check_agent_readiness` with `baseUrl` set to the production URL.
- Enter redirects from the old site in the CMS (*Redirects*) and spot-check them: `curl -sI https://site/old-path` → `308`.
- Submit the form once and confirm it arrives (CMS *Form submissions* and/or email via Resend).
- Submit `sitemap.xml` to Google Search Console.

## Environment variables

All documented in [`.env.example`](.env.example) and validated in [`env.ts`](env.ts). With none set, the site uses demo content.
