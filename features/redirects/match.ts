import type { Redirect } from '@/features/cms/model'

function normalize(path: string) {
  const [pathname = '/'] = path.split(/[?#]/)
  const trimmed = pathname.replace(/\/+$/, '')
  return (trimmed === '' ? '/' : trimmed).toLowerCase()
}

/**
 * Find the redirect for a path. Sources are exact paths, or end in `/*` to match
 * a whole subtree; a `*` in the destination receives the matched remainder.
 *   /old-blog/*  →  /blog/*      /old-blog/hello  →  /blog/hello
 */
export function matchRedirect(path: string, redirects: Redirect[]) {
  const target = normalize(path)

  for (const redirect of redirects) {
    const source = normalize(redirect.source)
    if (source === target)
      return { destination: redirect.destination.replace('*', ''), permanent: redirect.permanent }
  }

  for (const redirect of redirects) {
    if (!redirect.source.endsWith('/*')) continue
    const prefix = normalize(redirect.source.slice(0, -2))
    if (target === prefix || target.startsWith(`${prefix}/`)) {
      const rest = target.slice(prefix.length).replace(/^\//, '')
      return {
        destination: redirect.destination.includes('*')
          ? redirect.destination.replace('*', rest)
          : redirect.destination,
        permanent: redirect.permanent,
      }
    }
  }

  return null
}
