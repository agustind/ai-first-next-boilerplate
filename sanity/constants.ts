/** Fixed document ids for singletons. */
export const SETTINGS_ID = 'siteSettings'
export const SINGLETON_TYPES = new Set(['settings'])

/** Slugs that would collide with app routes. */
export const RESERVED_SLUGS = [
  'api',
  'blog',
  'studio',
  'section-preview',
  'llms.txt',
  'feed.xml',
  'sitemap.xml',
]
