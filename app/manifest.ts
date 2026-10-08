import type { MetadataRoute } from 'next'
import { getContentSource } from '@/features/cms'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getContentSource().getSettings()
  return {
    name: settings.siteName,
    short_name: settings.siteName,
    description: settings.description,
    start_url: '/',
    display: 'browser',
    icons: [{ src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }],
  }
}
