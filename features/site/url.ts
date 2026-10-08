import { env } from '@/env'

export const siteUrl = (env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Absolute URL for a path or already-absolute URL. */
export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/** Markdown twin of a page: `/` → `/index.md`, `/about` → `/about.md`. */
export function markdownPath(uri: string) {
  return uri === '/' ? '/index.md' : `${uri.replace(/\/$/, '')}.md`
}

/** Path params of an optional catch-all → URI. `undefined`/`[]` → `/`. */
export function segmentsToUri(segments: string[] | undefined) {
  return `/${(segments ?? []).map((segment) => decodeURIComponent(segment)).join('/')}`
}
