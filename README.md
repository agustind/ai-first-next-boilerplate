# AI-first Next.js boilerplate

A production-ready starting point for content-driven websites. Clone it, rename it, ship it.

- **Next.js 16**: App Router, Cache Components (static by default, refreshed when content changes), React 19.3 + React Compiler, Turbopack, typed routes, `proxy.ts`.
- **Headless CMS behind an adapter**: Sanity (embedded Studio, Live content, visual editing) by default, Directus optional, and built-in demo content so a fresh clone runs with zero setup.
- **Schema as a system**: one folder per page-builder section holds its content model, CMS schemas, query, component, sample and Markdown export. Tests keep every layer in sync; `npm run new:section` scaffolds all of it.
- **Production basics done**: SEO metadata, JSON-LD, sitemap, robots, RSS, OG images, CMS-managed redirects with real 308s, real 404s, forms with spam protection, staging basic auth, analytics, security headers, accessibility.
- **Agent-ready in production**: every page as Markdown (`/about.md` or `Accept: text/markdown`), `llms.txt`, `openapi.json`, a public read-only MCP server at `/api/mcp`, an AI-crawler policy.
- **Agent-native in development**: `AGENTS.md`, 46 skills (project workflows, Matt Pocock's engineering skills, official Next.js and Sanity skills) and MCP servers so agents can check their own work (`site-check`, `next-devtools`, `chrome-devtools`, `sanity`).
- **Quality gates**: Biome, strict TypeScript, Vitest, Knip, Lefthook + commitlint, GitHub Actions CI.

## Contents

1. [Prerequisites](#1-prerequisites)
2. [Create the project](#2-create-the-project)
3. [Set up the CMS](#3-set-up-the-cms): [Sanity](#option-a-sanity-recommended) or [Directus](#option-b-directus)
4. [Make it yours](#4-make-it-yours)
5. [Deploy to Vercel](#5-deploy-to-vercel)
6. [Optional services](#6-optional-services): forms email, spam protection, analytics, staging password
7. [Launch checklist](#7-launch-checklist)
8. [After launch](#8-after-launch)
9. [Deploying somewhere other than Vercel](#9-deploying-somewhere-other-than-vercel)
10. [Reference](#reference): scripts, environment variables, project structure, troubleshooting

---

## 1. Prerequisites

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 24 (pinned in `.nvmrc`) | `node -v` |
| npm | 11+ (ships with Node 24) | `npm -v` |
| Git | any recent | `git --version` |
| GitHub account | for the repo and CI | |
| Vercel account | for hosting (free tier is fine to start) | |
| Sanity account | if you use Sanity (free tier is fine) | |
| Docker | only for local Directus | `docker info` |

With [nvm](https://github.com/nvm-sh/nvm): `nvm install 24 && nvm use`.

## 2. Create the project

### 2.1 Clone and start a fresh history

```bash
git clone https://github.com/agustind/ai-first-next-boilerplate.git acme-site
cd acme-site
rm -rf .git && git init -b main      # the new site gets its own history
nvm use                              # Node 24
npm install                          # also installs the git hooks (lefthook)
```

### 2.2 Rename it

```bash
npm run init
```

It asks for:

- **Project name**: the npm package name, e.g. `acme-site`
- **Site name**: shown in the demo content, e.g. `Acme`
- **Production URL**, e.g. `https://acme.com`

It updates `package.json`, the demo site name, and creates `.env.local` from `.env.example` (an existing `.env.local` is never overwritten). Non-interactive:

```bash
npm run init -- --name acme-site --site-name "Acme" --url https://acme.com --yes
```

### 2.3 Run it

```bash
npm run dev
```

Open http://localhost:3000. With no CMS configured the site runs on built-in demo content: pages, blog, forms (submissions are logged to the terminal), Markdown versions of every page, `llms.txt`, the MCP endpoint. Try:

- http://localhost:3000/section-preview: every page-builder section in isolation
- http://localhost:3000/about.md: the Markdown agents get
- http://localhost:3000/llms.txt

### 2.4 Push it to GitHub

```bash
git add -A
git commit -m "feat: initial site from boilerplate"
gh repo create acme-site --private --source . --push     # or create the repo on github.com and `git push -u origin main`
```

The pre-commit hook runs Biome and the typecheck; the commit-msg hook enforces [Conventional Commits](https://www.conventionalcommits.org) and rejects AI attribution trailers. CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, Knip and a build on every push and pull request.

## 3. Set up the CMS

Pick one. Sanity is the default and the most complete integration (live preview, click-to-edit, instant updates). The CMS is chosen by `CMS_PROVIDER` in `.env.local`, or inferred: a Sanity project id means Sanity, a `DIRECTUS_URL` means Directus, nothing means demo content.

### Option A: Sanity (recommended)

#### A.1 Create the Sanity project

```bash
npx sanity@latest login                       # opens the browser once
npx sanity@latest init --env .env.local       # create (or pick) a project + dataset
```

Choose **Create new project**, give it the site's name, and use the default dataset `production`. If the CLI offers to add Studio files or install packages, decline: the Studio is already embedded at `/studio`.

Then open `.env.local` and check it contains these two names exactly (if the CLI wrote the values under different names, rename them):

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123de
NEXT_PUBLIC_SANITY_DATASET=production
```

Or create the project by hand at [sanity.io/manage](https://www.sanity.io/manage) → **Create new project** (dataset `production`), and copy the **Project ID** into those two variables yourself.

#### A.2 Create the API tokens

In [sanity.io/manage](https://www.sanity.io/manage) → your project → **API** → **Tokens** → **Add API token**:

| Token name | Permissions | Goes into | Used for |
| --- | --- | --- | --- |
| `website-read` | **Viewer** | `SANITY_API_READ_TOKEN` | Draft mode, visual editing, live preview |
| `website-write` | **Editor** | `SANITY_API_WRITE_TOKEN` | Storing form submissions, `npm run sanity:seed` |

Copy each token right away (it's shown only once) into `.env.local`. Both are server-only secrets: never prefix them with `NEXT_PUBLIC_` or commit them.

#### A.3 Allow your site's origins (CORS)

Still under **API** → **CORS origins** → **Add CORS origin**. Add each one with **Allow credentials** checked:

- `http://localhost:3000`
- your production URL, e.g. `https://acme.com` (and `https://www.acme.com` if you use it)
- your Vercel preview URLs, e.g. `https://*.vercel.app` (or your team-scoped pattern)

Without these, the Studio can't log in and live updates don't reach the browser.

#### A.4 Load the starter content (optional, recommended)

```bash
npm run sanity:seed -- --dry-run    # preview what will be created
npm run sanity:seed                 # upload images + create the documents
```

This creates the site settings, Home/About/Contact pages, two blog posts with an author and categories, and a redirect. Running it again resets those documents and leaves everything else alone.

#### A.5 Open the Studio

```bash
npm run dev
```

Go to http://localhost:3000/studio and log in with your Sanity account. You'll find:

- **Site settings**: site name, description (used for SEO and `llms.txt`), navigation, footer, social links, default social image
- **Pages**: page builder. The home page is the page with slug `index`; other slugs are paths (`about`, `services/web-design`)
- **Posts / Authors / Categories**: the blog
- **Redirects**: old path → new path, applied with a real 308 (or 307 if "temporary")
- **Form submissions**: read-only inbox for the contact form
- **Presentation**: the live site in an iframe with click-to-edit overlays. Unpublished changes show instantly here

Publish something and reload the site: published changes appear within seconds without a rebuild (Sanity Live).

#### A.6 Invite editors

[sanity.io/manage](https://www.sanity.io/manage) → project → **Members** → **Invite**. Editors use the Studio at `https://your-domain/studio`.

#### A.7 Keep the schema snapshot current (optional)

After changing Sanity schemas:

```bash
npm run sanity:extract          # writes sanity-schema.json (read by agents and the Sanity MCP)
npx sanity schema deploy        # uploads the schema to Sanity (for Sanity's AI features and remote MCP)
```

### Option B: Directus

Directus support is newer than Sanity's: the adapter and schema bootstrap are covered by unit tests and dry runs. Run through this once on a local instance before you depend on it.

#### B.1 Run Directus locally

```bash
npm run directus:up          # Docker: Directus on http://localhost:8055
```

Default admin login is `admin@example.com` / `admin-password` (override with `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` before the first start). Data lives in `directus/data/` (git-ignored).

#### B.2 Create the schema from code

```bash
DIRECTUS_URL=http://localhost:8055 \
DIRECTUS_ADMIN_EMAIL=admin@example.com \
DIRECTUS_ADMIN_PASSWORD=admin-password \
npm run directus:bootstrap               # add -- --dry-run to preview the plan
```

It creates the collections (`settings`, `pages`, `posts`, `authors`, `redirects`, `form_submissions`, one per section type), the page-builder relation, public read access for published content and files, and a **Website** access policy. It's idempotent: re-run it after adding sections or fields.

#### B.3 Create the site's access token

In the Directus app: **User Directory** → **Create user** (e.g. `website@acme.com`) → assign the **Website** policy → **Token** → generate → save. Then in `.env.local`:

```bash
CMS_PROVIDER=directus
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=<the static token>
REVALIDATE_SECRET=<run: openssl rand -hex 32>
```

#### B.4 Add content

Create **Settings**, then a page with `uri` = `/`, add sections, and set status to **published**. Restart `npm run dev`.

#### B.5 Instant updates and previews

Published content is cached. To refresh it on every edit, create a **Flow** in Directus:

- Trigger: **Event Hook** → type **Action (non-blocking)** → scope `items.create`, `items.update`, `items.delete` on your content collections
- Operation: **Webhook / Request URL**, `POST https://<your-site>/api/revalidate`, header `Authorization: Bearer <REVALIDATE_SECRET>`, body `{"tags":["directus"]}`

For previews, set the pages collection **Preview URL** to `https://<your-site>/api/draft-mode/enable?secret=<REVALIDATE_SECRET>&redirect={{uri}}`.

#### B.6 Directus in production

Don't use the local Docker setup in production. Use [Directus Cloud](https://directus.io/cloud) or your own hosted instance with Postgres, then:

1. Set Directus `PUBLIC_URL` to its own URL and `CORS_ORIGIN` to your site's domain.
2. Run the bootstrap against it with an admin token: `DIRECTUS_URL=https://cms.acme.com DIRECTUS_ADMIN_TOKEN=… npm run directus:bootstrap`.
3. Create the Website user and token (B.3) and use them in Vercel's environment variables.
4. Point the Flow (B.5) at the production site.

More details: [`directus/README.md`](directus/README.md).

## 4. Make it yours

| What | Where |
| --- | --- |
| Colours, radius, widths (design tokens) | `features/style/globals.css` → `@theme` |
| Fonts | `features/style/fonts.ts` (any `next/font/google` font) |
| Favicon / logo mark | `app/icon.svg` |
| Default social card design | `app/api/og/route.tsx` |
| Site name, navigation, footer, social links | CMS → Site settings |
| New section types | `npm run new:section` (see `.agents/skills/add-section`) |
| New fields on pages/posts | `.agents/skills/content-model` |
| Remove features you don't need (Directus, blog, forms, MCP…) | `.agents/skills/trim-features`, then `npm run knip` |

Before every commit (the hooks run part of this automatically):

```bash
npm run check      # lint + typecheck + tests + unused-code check
npm run build      # production build
```

## 5. Deploy to Vercel

### 5.1 Import the repository

1. [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repository.
2. Framework preset: **Next.js** (auto-detected). Leave the build and output settings as they are.
3. Before the first deploy, open **Environment Variables** (5.2). You can also set them later and redeploy.
4. **Deploy**.

In **Project Settings** → **General** → **Node.js Version**, select **24.x**.

### 5.2 Environment variables

Add these in **Project Settings** → **Environment Variables**. Values can differ per environment (Production / Preview / Development).

| Variable | Production | Preview | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://acme.com` | your preview domain, or leave as production | Canonical URLs, sitemap, Markdown links. Must match the real domain in production |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✓ | ✓ | Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | `production` (or a `staging` dataset) | Sanity |
| `SANITY_API_READ_TOKEN` | ✓ | ✓ | Sanity, secret |
| `SANITY_API_WRITE_TOKEN` | ✓ | optional | Form storage, secret |
| `CMS_PROVIDER` | optional | optional | Only to force a provider |
| `DIRECTUS_URL`, `DIRECTUS_TOKEN` | ✓ | ✓ | Directus only |
| `REVALIDATE_SECRET` | ✓ | ✓ | Required for Directus; for Sanity only used by scripts and integrations |
| `SITE_PASSWORD` | leave empty | set it | Password-protects preview deployments (user `preview`, or `SITE_USERNAME`) |
| `RESEND_API_KEY`, `FORMS_NOTIFY_EMAIL`, `FORMS_FROM_EMAIL` | optional | optional | Email on form submission (section 6) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | optional | optional | Spam protection (section 6) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | optional | leave empty | Analytics (section 6) |
| `AI_TRAINING_CRAWLERS` | `allow` or `block` | | AI search bots are always allowed |
| `PUBLIC_MCP_ENABLED` | `true` | | Set `false` to turn off `/api/mcp` |

All variables are documented in [`.env.example`](.env.example) and validated at build time by [`env.ts`](env.ts). Variables starting with `NEXT_PUBLIC_` are baked in at build time: **redeploy after changing them**.

### 5.3 Connect your domain

1. **Project Settings** → **Domains** → add `acme.com` (and `www.acme.com`; pick which one redirects to the other).
2. At your DNS provider, add the records Vercel shows: usually an `A` record for the apex and a `CNAME` for `www`. Wait for the certificate (usually minutes).
3. Set `NEXT_PUBLIC_SITE_URL=https://acme.com` for Production and **redeploy** (Deployments → ⋯ → Redeploy).
4. Add `https://acme.com` to Sanity **CORS origins** with credentials (A.3), or to Directus `CORS_ORIGIN`.

### 5.4 How deployments behave

- **Every push to `main`** deploys to production. **Every other branch or pull request** gets a preview URL.
- **Only production is indexable.** `robots.txt` disallows everything unless `VERCEL_ENV=production`, so previews never end up in Google.
- **Content changes don't need a deploy.** Published pages are static, and Sanity Live (or the Directus Flow) refreshes them within seconds. New pages work immediately.
- **Code changes do need a deploy:** push to `main`.

### 5.5 Check the deployment

```bash
SITE=https://acme.com
curl -sI $SITE | head -1                     # HTTP/2 200
curl -sI $SITE/this-does-not-exist | head -1 # HTTP/2 404
curl -s  $SITE/robots.txt                    # Allow rules + Sitemap line (production only)
curl -s  $SITE/llms.txt | head
curl -s  -H "Accept: text/markdown" $SITE/ | head
```

With an AI agent in this repo you can also ask: *"Run site-check `crawl_site` and `check_agent_readiness` against https://acme.com"*.

## 6. Optional services

### Email notifications for form submissions (Resend)

1. Create an account at [resend.com](https://resend.com), add and verify your domain (DNS records).
2. **API Keys** → create a key with *Sending access*.
3. Set `RESEND_API_KEY`, `FORMS_NOTIFY_EMAIL` (who receives submissions) and `FORMS_FROM_EMAIL` (e.g. `Acme Website <forms@acme.com>`, on the verified domain).

Submissions are also stored in the CMS (*Form submissions*) when `SANITY_API_WRITE_TOKEN` is set, or in Directus. In production, if neither storage nor email is configured, the form shows an error instead of silently dropping messages.

### Spam protection (Cloudflare Turnstile)

Honeypot and timing checks always run. For stronger protection:

1. [Cloudflare dashboard](https://dash.cloudflare.com) → **Turnstile** → **Add widget** → add your production and preview domains (and `localhost`), mode *Managed*.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. Redeploy.

### Analytics (Umami)

1. Create a site in [Umami Cloud](https://cloud.umami.is) (or your self-hosted Umami).
2. Set `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (and `NEXT_PUBLIC_UMAMI_SRC` if self-hosted). Leave it empty on Preview to keep test traffic out.

### Password-protect previews and staging

Set `SITE_PASSWORD` (and optionally `SITE_USERNAME`, default `preview`) on the **Preview** environment. The whole site, including `llms.txt` and the sitemap, then asks for HTTP basic auth. `/api/revalidate` stays reachable for webhooks.

## 7. Launch checklist

- [ ] `npm run check` and `npm run build` pass locally; CI is green on `main`.
- [ ] Production env vars are set; `NEXT_PUBLIC_SITE_URL` is the real domain (with `https://`); redeployed after setting it.
- [ ] Domain connected, HTTPS works, `www` and apex resolve to one canonical host.
- [ ] CMS CORS includes the production domain; `/studio` works on production; editors invited.
- [ ] Site settings filled in: name, description, navigation, footer, social links, default social image.
- [ ] Every page has an SEO title and description (Page → SEO tab); no placeholder content left.
- [ ] Old site's URLs entered under **Redirects**; spot-checked with `curl -sI https://acme.com/old-path` (expect `308`).
- [ ] Contact form tested on production: submission arrives in the CMS and/or by email.
- [ ] `https://acme.com/robots.txt` shows `Allow` rules and a `Sitemap:` line; a preview URL's robots shows `Disallow: /`.
- [ ] `site-check` → `crawl_site` against production reports no broken links or errors.
- [ ] Sitemap submitted in [Google Search Console](https://search.google.com/search-console) (and [Bing Webmaster Tools](https://www.bing.com/webmasters)).
- [ ] Social cards checked (paste a URL into Slack/LinkedIn/X, or use [opengraph.xyz](https://www.opengraph.xyz)).
- [ ] Analytics receiving pageviews (if enabled).

## 8. After launch

- **Content**: editors work in `/studio`; changes go live on publish. Use **Presentation** to preview before publishing.
- **Code changes**: branch → pull request (preview deployment + CI) → merge to `main` (production).
- **Dependencies**: Dependabot opens weekly PRs (minor/patch grouped). Majors for TypeScript, `@portabletext/react` and `@types/node` are ignored because they must follow Next.js / next-sanity. Upgrade Next.js with `npx next upgrade`.
- **Agent skills**: `npx skills update` refreshes the third-party skills (versions pinned in `skills-lock.json`).
- **Backups (Sanity)**: `npx sanity datasets export production backup.tar.gz`.

## 9. Deploying somewhere other than Vercel

Any host that runs Node 24 works:

```bash
npm ci
npm run build
NODE_ENV=production PORT=3000 npm start
```

- Set the same environment variables at build **and** runtime. `NEXT_PUBLIC_*` are baked in at build.
- `robots.txt` uses `NODE_ENV` when `VERCEL_ENV` is absent, so a non-Vercel staging server built in production mode is indexable unless you set `SITE_PASSWORD`, or run it behind your own auth.
- The Next.js cache lives on the server's disk. With several instances behind a load balancer, configure a shared [cache handler](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers) so content refreshes reach every instance.
- Docker: use Next's [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) (`output: 'standalone'` in `next.config.ts`).

---

## Reference

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run check` | Biome + typecheck + tests + Knip (CI also builds) |
| `npm run lint` / `npm run format` | Biome check / auto-fix |
| `npm run typecheck` | Route types + `tsc` |
| `npm test` / `npm run test:watch` | Vitest |
| `npm run knip` | Unused files, exports and dependencies |
| `npm run init` | Rename the project, create `.env.local` |
| `npm run new:section` | Scaffold a page-builder section in every layer |
| `npm run sanity:seed` | Load the starter content into Sanity (`-- --dry-run` to preview) |
| `npm run sanity:extract` | Write `sanity-schema.json` |
| `npm run directus:up` | Local Directus via Docker |
| `npm run directus:bootstrap` | Create the Directus schema (`-- --dry-run` to preview) |
| `npm run mcp` | The `site-check` MCP server (agents start it via `.mcp.json`) |

### Environment variables

Documented in [`.env.example`](.env.example), validated in [`env.ts`](env.ts). With none set, the site runs on demo content.

### URLs the site exposes

| URL | What |
| --- | --- |
| `/studio` | Sanity Studio |
| `/section-preview` | Every section with sample content (not indexed) |
| `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/manifest.webmanifest` | Standard |
| `/llms.txt` | Site map for LLMs |
| `/<path>.md`, `/index.md` | Markdown version of any page (also via `Accept: text/markdown`) |
| `/openapi.json` | Machine-readable description of the agent endpoints |
| `/api/mcp` | Public read-only MCP server (streamable HTTP) |
| `/api/forms/contact` | Contact form JSON API (`POST`) |
| `/api/og?title=…` | Generated social card |
| `/api/draft-mode/enable` · `/disable` | Preview mode |
| `/api/revalidate` | Cache refresh webhook (`Authorization: Bearer $REVALIDATE_SECRET`) |

### How it fits together

```
CMS (Sanity | Directus | demo) ──adapter──► Zod content model ──► React (Server Components)
                                                   │
                                                   ├─► metadata, JSON-LD, sitemap, RSS
                                                   └─► Markdown, llms.txt, public MCP (agents)
```

Details in [docs/architecture.md](docs/architecture.md); rules for agents (and humans) in [AGENTS.md](AGENTS.md).

### Project structure

```
app/(web)/        site routes          features/cms/            content model + adapters
app/studio/       Sanity Studio        features/page-builder/   sections + registries
app/api/          agent & form APIs    features/agents/         markdown, llms.txt, MCP, robots policy
components/       UI primitives        features/{seo,forms,blog,…}/
sanity/           Studio schemas       scripts/                 init, seed, bootstrap, site-check MCP
.agents/skills/   agent skills         templates/               plop templates
```

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| `/studio` says "Sanity is not configured" | Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and restart `npm run dev` |
| Studio login loops, or a CORS error in the console | Add the origin under Sanity → API → CORS origins **with credentials** |
| Published changes don't show up | Sanity: check CORS for the site's domain (Live runs in the browser). Directus: check the Flow and `REVALIDATE_SECRET` |
| Presentation shows "Unable to connect" | `SANITY_API_READ_TOKEN` missing in that environment |
| Form says "Something went wrong" in production | Set `SANITY_API_WRITE_TOKEN` (Editor) or configure Resend |
| Build fails with "Invalid environment variables" | A variable in `env.ts` has the wrong format (e.g. `NEXT_PUBLIC_SITE_URL` without `https://`, `REVALIDATE_SECRET` shorter than 16 characters) |
| Google shows a preview URL | Preview deployments are `noindex` via robots; also set `SITE_PASSWORD` on Preview |
| A section disappeared from a page | It failed validation: check the server log for `[cms] … failed validation`, or open the page in Presentation (the error is shown inline) |

## License

MIT, see [LICENSE.md](LICENSE.md) (includes third-party skill notices).
