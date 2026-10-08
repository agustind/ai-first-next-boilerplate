import type { Post, Settings } from '@/features/cms/model'
import { absoluteUrl, siteUrl } from '@/features/site/url'

/** schema.org builders. Render with <JsonLd data={...} />. */

export function websiteJsonLd(settings: Settings) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.siteName,
        description: settings.description || undefined,
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: settings.siteName,
        url: siteUrl,
        logo: absoluteUrl('/icon.svg'),
        sameAs: settings.social.map((link) => link.href).filter((href) => href.startsWith('http')),
      },
    ],
  }
}

export function articleJsonLd(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.image ? [absoluteUrl(post.image.src)] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author ? { '@type': 'Person', name: post.author.name } : undefined,
    publisher: { '@id': `${siteUrl}/#organization` },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}
