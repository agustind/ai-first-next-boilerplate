import type { MetadataRoute } from 'next'
import { getContentSource } from '@/features/cms'
import { absoluteUrl } from '@/features/site/url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await getContentSource().listRoutes()
  const entries = routes
    .filter((route) => !route.noIndex)
    .map((route) => ({
      url: absoluteUrl(route.uri),
      lastModified: route.updatedAt,
      priority: route.uri === '/' ? 1 : route.type === 'page' ? 0.8 : 0.6,
    }))
  return [...entries, { url: absoluteUrl('/blog'), priority: 0.7 }]
}
