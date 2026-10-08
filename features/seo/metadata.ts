import type { Metadata } from 'next'
import type { Image, Seo, Settings } from '@/features/cms/model'
import { absoluteUrl, markdownPath } from '@/features/site/url'

type BuildMetadataInput = {
  title: string
  uri: string
  seo?: Seo
  settings: Settings
  description?: string
  image?: Image
  type?: 'website' | 'article'
  publishedAt?: string
  updatedAt?: string
}

/** Social card: CMS image, else the generated /api/og card. */
function socialImage(title: string, image: Image | undefined, settings: Settings) {
  const chosen = image ?? settings.ogImage
  if (chosen)
    return {
      url: absoluteUrl(chosen.src),
      width: chosen.width,
      height: chosen.height,
      alt: chosen.alt,
    }
  const params = new URLSearchParams({ title, site: settings.siteName })
  return { url: absoluteUrl(`/api/og?${params}`), width: 1200, height: 630, alt: title }
}

/**
 * Metadata for any CMS document: canonical URL, social cards, robots, and a
 * `text/markdown` alternate so agents can discover the Markdown version.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const { uri, settings, seo } = input
  const title = seo?.title ?? input.title
  const description = seo?.description ?? input.description ?? settings.description
  const image = socialImage(title, seo?.image ?? input.image, settings)

  return {
    title: uri === '/' ? { absolute: title } : title,
    description,
    alternates: {
      canonical: uri,
      types: { 'text/markdown': markdownPath(uri) },
    },
    robots: seo?.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? 'website',
      url: uri,
      title,
      description,
      siteName: settings.siteName,
      images: [image],
      ...(input.type === 'article'
        ? { publishedTime: input.publishedAt, modifiedTime: input.updatedAt }
        : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  }
}
