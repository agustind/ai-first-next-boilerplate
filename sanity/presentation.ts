import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from 'sanity/presentation'

const pagePath = (slug?: string) => (slug === 'index' ? '/' : `/${slug ?? ''}`)

/** Maps documents ↔ URLs for the Presentation tool (visual editing). */
export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/', filter: `_type == "page" && slug.current == "index"` },
    { route: '/blog/:slug', filter: `_type == "post" && slug.current == $slug` },
    { route: '/:slug', filter: `_type == "page" && slug.current == $slug` },
  ]),
  locations: {
    page: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [{ title: doc?.title ?? 'Page', href: pagePath(doc?.slug) }],
      }),
    }),
    post: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title ?? 'Post', href: `/blog/${doc?.slug}` },
          { title: 'Blog', href: '/blog' },
        ],
      }),
    }),
    settings: defineLocations({
      message: 'Site settings appear on every page',
      locations: [{ title: 'Home', href: '/' }],
    }),
  },
}
