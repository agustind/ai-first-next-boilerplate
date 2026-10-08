# Directus (alternative CMS)

The site works with Directus through the adapter in `features/cms/directus/`.
The schema is code: `features/cms/directus/collections.ts` (pages, posts, settings…)
and each section's `directus.ts`. `npm run directus:bootstrap` turns that into
collections, fields, relations and permissions.

## Local setup

```bash
npm run directus:up                       # Directus on http://localhost:8055 (Docker)
DIRECTUS_URL=http://localhost:8055 \
DIRECTUS_ADMIN_EMAIL=admin@example.com \
DIRECTUS_ADMIN_PASSWORD=admin-password \
npm run directus:bootstrap                # idempotent; add --dry-run to preview
```

The bootstrap also:

- grants the **Public** policy read access to published content and files, so
  `/assets/<id>` URLs load in the browser without a token;
- creates a **Website** policy (read all content incl. drafts for preview,
  create form submissions).

Then in the Directus app:

1. **User Directory → Create user** (e.g. `website@example.com`), give it the
   **Website** policy, and under *Token* generate a static token. Save.
2. Add to `.env.local`:
   ```bash
   CMS_PROVIDER=directus
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_TOKEN=<the static token>
   REVALIDATE_SECRET=<16+ random characters>
   ```
3. Create a page with `uri` `/`, add sections, set status to **published**.

## Keeping the site fresh

Published content is cached and tagged `directus`. Add a **Flow** so edits show
up immediately:

- Trigger: *Event Hook* → *Action (non-blocking)* → scope `items.create`,
  `items.update`, `items.delete` on all content collections.
- Operation: *Webhook / Request URL* → `POST https://<your-site>/api/revalidate`,
  header `Authorization: Bearer <REVALIDATE_SECRET>`, body `{"tags":["directus"]}`.

## Draft preview

`/api/draft-mode/enable?secret=<REVALIDATE_SECRET>&redirect=/your-page` turns on
draft mode: unpublished items are shown and caching is bypassed. Use it as the
*Preview URL* of the pages collection (`…&redirect={{uri}}`).
