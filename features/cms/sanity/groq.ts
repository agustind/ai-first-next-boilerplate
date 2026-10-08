/**
 * GROQ building blocks that project Sanity documents into the CMS-agnostic
 * content model (features/cms/model). Section folders compose these in their
 * `query.ts`; keep projections and model shapes in lockstep.
 */

/** URI of a page/post, relative to `ref` (e.g. `"internal->"` for a reference, `""` for self). */
export const uri = (ref = '') =>
  `select(${ref}_type == "post" => "/blog/" + ${ref}slug.current, ${ref}slug.current == "index" => "/", "/" + ${ref}slug.current)`

/** Fields of an image object (asset + alt + hotspot) in the context of that object. */
export const IMAGE_FIELDS = `
  "src": asset->url,
  "alt": coalesce(alt, asset->altText, ""),
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "blurDataURL": asset->metadata.lqip,
  hotspot{ x, y }
`

/** `"<as>": { ...image }` or null when no asset is set. */
export const image = (field: string, as = field) =>
  `"${as}": select(defined(${field}.asset) => ${field}{ ${IMAGE_FIELDS} })`

/** Fields of a `link` object → { label, href }. */
export const LINK_FIELDS = `
  label,
  "href": select(
    linkType == "internal" => ${uri('internal->')} + select(defined(anchor) => "#" + anchor, ""),
    url
  )
`

export const links = (field: string) => `"${field}": ${field}[]{ ${LINK_FIELDS} }`

/** Portable Text field → { format: "portable-text", blocks }. Resolves link hrefs and image blocks. */
export const richText = (field: string) => `"${field}": {
  "format": "portable-text",
  "blocks": ${field}[]{
    ...,
    _type == "image" => { _type, _key, caption, "image": { ${IMAGE_FIELDS} } },
    markDefs[]{ ..., _type == "link" => { _key, _type, ${LINK_FIELDS} } }
  }
}`

export const SEO_FIELDS = `"seo": {
  "title": seo.title,
  "description": seo.description,
  "noIndex": seo.noIndex,
  ${image('seo.image', 'image')}
}`

/** Fields every section shares (see features/page-builder/define.ts). */
export const SECTION_BASE = `"key": _key, "type": _type, anchor, tone`
