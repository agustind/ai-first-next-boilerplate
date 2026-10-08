import type { DirectusCollectionSpec } from './spec'

/** Core collections, created by `npm run directus:bootstrap`. Field names are the contract with ./adapter.ts. */
export const directusCollections: DirectusCollectionSpec[] = [
  {
    collection: 'settings',
    singleton: true,
    fields: [
      { field: 'site_name', kind: 'string', required: true },
      { field: 'description', kind: 'text' },
      { field: 'navigation', kind: 'links' },
      { field: 'footer_text', kind: 'string' },
      { field: 'footer_links', kind: 'links' },
      { field: 'social', kind: 'links' },
      { field: 'og_image', kind: 'image' },
    ],
  },
  {
    collection: 'authors',
    displayTemplate: '{{name}}',
    fields: [
      { field: 'name', kind: 'string', required: true },
      { field: 'role', kind: 'string' },
      { field: 'image', kind: 'image' },
    ],
  },
  {
    collection: 'pages',
    status: true,
    displayTemplate: '{{title}} ({{uri}})',
    fields: [
      { field: 'title', kind: 'string', required: true },
      {
        field: 'uri',
        kind: 'string',
        required: true,
        note: 'Full path: "/" for home, "/about", "/services/web".',
      },
      { field: 'seo_title', kind: 'string' },
      { field: 'seo_description', kind: 'text' },
      { field: 'seo_image', kind: 'image' },
      { field: 'seo_no_index', kind: 'boolean' },
      // `sections` (many-to-any builder) is created by the bootstrap script.
    ],
  },
  {
    collection: 'posts',
    status: true,
    displayTemplate: '{{title}}',
    fields: [
      { field: 'title', kind: 'string', required: true },
      { field: 'slug', kind: 'string', required: true },
      { field: 'excerpt', kind: 'text' },
      { field: 'image', kind: 'image' },
      { field: 'published_at', kind: 'datetime' },
      { field: 'author', kind: 'm2o', related: 'authors' },
      { field: 'tags', kind: 'tags' },
      { field: 'body', kind: 'richText' },
      { field: 'seo_title', kind: 'string' },
      { field: 'seo_description', kind: 'text' },
      { field: 'seo_image', kind: 'image' },
      { field: 'seo_no_index', kind: 'boolean' },
    ],
  },
  {
    collection: 'redirects',
    displayTemplate: '{{source}} → {{destination}}',
    fields: [
      {
        field: 'source',
        kind: 'string',
        required: true,
        note: 'Path. End with /* to match a subtree.',
      },
      { field: 'destination', kind: 'string', required: true },
      { field: 'permanent', kind: 'boolean' },
    ],
  },
  {
    collection: 'form_submissions',
    displayTemplate: '{{form}} · {{submitted_at}}',
    fields: [
      { field: 'form', kind: 'string' },
      { field: 'page', kind: 'string' },
      { field: 'submitted_at', kind: 'datetime' },
      { field: 'data', kind: 'json' },
    ],
  },
]
