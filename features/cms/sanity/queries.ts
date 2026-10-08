import { sectionsProjection } from '@/features/page-builder/queries'
import { image, links, richText, SEO_FIELDS, uri } from './groq'

export const SETTINGS_QUERY = `*[_id == "siteSettings"][0]{
  siteName,
  description,
  ${links('navigation')},
  "footer": { "text": footerText, ${links('footerLinks').replace('"footerLinks"', '"links"')} },
  ${links('social')},
  ${image('ogImage')}
}`

export const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  "id": _id,
  title,
  "uri": ${uri()},
  ${SEO_FIELDS},
  ${sectionsProjection()},
  "updatedAt": _updatedAt
}`

const POST_SUMMARY = `
  "id": _id,
  title,
  "slug": slug.current,
  excerpt,
  ${image('mainImage', 'image')},
  "publishedAt": coalesce(publishedAt, _createdAt),
  "updatedAt": _updatedAt,
  "author": author->{ name, role, ${image('image')} },
  "categories": categories[]->{ title, "slug": slug.current }
`

export const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  ${POST_SUMMARY},
  ${richText('body')},
  ${SEO_FIELDS}
}`

export const POSTS_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...$limit]{
  ${POST_SUMMARY}
}`

export const ROUTES_QUERY = `*[_type in ["page", "post"] && defined(slug.current)]{
  "uri": ${uri()},
  title,
  "type": _type,
  "updatedAt": _updatedAt,
  "noIndex": seo.noIndex
}`

export const REDIRECTS_QUERY = `*[_type == "redirect" && defined(source) && defined(destination)]{
  source, destination, permanent
}`
