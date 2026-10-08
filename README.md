# AI-first Next.js boilerplate

A production-ready starting point for content-driven websites. Clone it, rename it, ship it.

- **Next.js 16** — App Router, Cache Components (static by default, event-driven freshness), React 19.3 + React Compiler, Turbopack, typed routes, `proxy.ts`.
- **Headless CMS behind an adapter** — Sanity (embedded Studio, Live content, visual editing) by default, Directus optional, and built-in demo content so a fresh clone runs with zero setup.
- **Schema as a system** — one folder per page-builder section holds its content model, CMS schemas, query, component, sample, Markdown export. Tests keep every layer in sync; `npm run new:section` scaffolds all of it.
- **Production basics done** — SEO metadata, JSON-LD, sitemap, robots, RSS, OG images, CMS-managed redirects with real 308s, real 404s, forms with spam protection, staging basic auth, analytics hook, security headers, accessibility.
- **Agent-ready in production** — every page as Markdown (`/about.md` or `Accept: text/markdown`), `llms.txt`, `openapi.json`, a public read-only MCP server at `/api/mcp`, AI-crawler policy.
- **Agent-native in development** — `AGENTS.md`, 46 skills (project workflows + Matt Pocock's engineering skills + official Next.js and Sanity skills), and MCP servers so agents can check their own work (`site-check`, `next-devtools`, `chrome-devtools`, `sanity`).
- **Quality gates** — Biome, TypeScript strict, Vitest, Knip, Lefthook + commitlint, GitHub Actions CI.

## Quick start

```bash
git clone <this repo> my-site && cd my-site
rm -rf .git && git init          # start a fresh history
nvm use                          # Node 24
npm install
npm run init                     # name the project, create .env.local
npm run dev                      # http://localhost:3000 — demo content, no CMS needed
```

Then connect a CMS and deploy: see **[GETTING-STARTED.md](GETTING-STARTED.md)**.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run check` | Biome + typecheck + tests + Knip (CI runs the same plus a build) |
| `npm run new:section` | Scaffold a page-builder section in every layer |
| `npm run init` | Rename the project and create `.env.local` |
| `npm run sanity:seed` | Load the demo content into your Sanity dataset |
| `npm run sanity:extract` | Write `sanity-schema.json` (schema snapshot for agents) |
| `npm run directus:up` / `directus:bootstrap` | Local Directus + schema-as-code |
| `npm run mcp` | Start the `site-check` MCP server (agents launch it via `.mcp.json`) |

## How it fits together

```
CMS (Sanity | Directus | demo) ──adapter──► Zod content model ──► React (Server Components)
                                                   │
                                                   ├─► metadata, JSON-LD, sitemap, RSS
                                                   └─► Markdown, llms.txt, public MCP (agents)
```

Read [docs/architecture.md](docs/architecture.md) for the details and [AGENTS.md](AGENTS.md) for the rules agents follow (they apply to humans too).

## Project structure

```
app/(web)/        site routes          features/cms/            content model + adapters
app/studio/       Sanity Studio        features/page-builder/   sections + registries
app/api/          agent & form APIs    features/agents/         markdown, llms.txt, MCP, robots policy
components/       UI primitives        features/{seo,forms,blog,…}/
sanity/           Studio schemas       scripts/                 init, seed, bootstrap, site-check MCP
.agents/skills/   agent skills         templates/               plop templates
```

## License

MIT — see [LICENSE.md](LICENSE.md) (includes third-party skill notices).
