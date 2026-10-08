import type { ReactNode } from 'react'

export { metadata, viewport } from 'next-sanity/studio'

/** Root layout for the embedded Studio (separate from the site's (web) layout). */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
