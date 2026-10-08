import type { Metadata, Viewport } from 'next'
import { type ReactNode, Suspense, ViewTransition } from 'react'
import { JsonLd } from '@/components/json-ld'
import { Umami } from '@/features/analytics/umami'
import { LiveContent } from '@/features/draft-mode/live'
import { websiteJsonLd } from '@/features/seo/structured-data'
import { SiteFooter } from '@/features/site/footer'
import { SiteHeader, SiteHeaderFallback } from '@/features/site/header'
import { getSiteSettings } from '@/features/site/settings'
import { SkipLink } from '@/features/site/skip-link'
import { siteUrl } from '@/features/site/url'
import { fontVariables } from '@/features/style/fonts'
import '@/features/style/globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(siteUrl),
    title: { default: settings.siteName, template: `%s · ${settings.siteName}` },
    description: settings.description,
    applicationName: settings.siteName,
    alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#16171d' },
  ],
}

export default function WebLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <Suspense fallback={<SiteHeaderFallback />}>
          <SiteHeader />
        </Suspense>
        <main id="content" className="flex-1">
          <ViewTransition>{children}</ViewTransition>
        </main>
        <Suspense>
          <SiteFooter />
          <SiteJsonLd />
        </Suspense>
        <Suspense>
          <LiveContent />
        </Suspense>
        <Umami />
      </body>
    </html>
  )
}

async function SiteJsonLd() {
  return <JsonLd data={websiteJsonLd(await getSiteSettings())} />
}
