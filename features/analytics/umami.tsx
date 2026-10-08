import Script from 'next/script'
import { env } from '@/env'

/** Privacy-friendly analytics (https://umami.is). Renders nothing unless configured. */
export function Umami() {
  if (!env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) return null
  return (
    <Script
      src={env.NEXT_PUBLIC_UMAMI_SRC}
      data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
      data-do-not-track="true"
      strategy="afterInteractive"
    />
  )
}
