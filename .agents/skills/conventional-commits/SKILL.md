---
name: conventional-commits
description: Commit message format and git rules for this repo, including the ban on AI attribution trailers. Use whenever you create a commit or PR.
---

# Commits

Format (enforced by commitlint in the `commit-msg` hook):

```
<type>(<optional scope>): <imperative summary, lower case, no period>

<optional body: why, not what>
```

Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`. Breaking change: `feat!:` plus a `BREAKING CHANGE:` footer.

Scopes we use: `sections`, `cms`, `sanity`, `directus`, `agents`, `seo`, `forms`, `blog`, `ui`, `mcp`, `deps`.

Examples: `feat(sections): add testimonial section` · `fix(cms): drop sections with invalid links instead of the page` · `docs(agents): document the search MCP tool`.

## Attribution: never credit an AI tool

- **No `Co-Authored-By:` trailers for AI tools** (Claude, Copilot, Cursor, Codex…), no "Generated with …" lines, in commits or PR descriptions. Those trailers add the bot to the repo's GitHub contributors.
- The `commit-msg` hook (`scripts/git/no-ai-attribution.mjs`) rejects them; `.claude/settings.json` disables Claude Code's attribution. Don't bypass with `--no-verify`.

## Rules

- One logical change per commit; run `npm run check` before committing (pre-commit runs Biome + typecheck).
- Never commit `.env*` (except `.env.example`), tokens or form submission data.
