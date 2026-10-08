import type { Metadata } from 'next'
import { fontVariables } from '@/features/style/fonts'
import '@/features/style/globals.css'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

/** Served for URLs that match no route at all (the app has two root layouts). */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="grid min-h-dvh place-items-center p-8 text-center">
        <div>
          <p className="font-mono text-muted-fg text-sm">404</p>
          <h1 className="mt-3 font-semibold text-4xl tracking-tight">Page not found</h1>
          <a href="/" className="mt-8 inline-block underline underline-offset-4">
            Back home
          </a>
        </div>
      </body>
    </html>
  )
}
