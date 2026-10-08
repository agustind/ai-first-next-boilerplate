import { type NextRequest, NextResponse } from 'next/server'
import { isMarkdownEligiblePath, prefersMarkdown } from '@/features/agents/prefers-markdown'
import { BASIC_AUTH_EXCLUDED, isAuthorized } from '@/features/auth/basic-auth'

/**
 * Runs before every matched request:
 * 1. Optional basic auth (SITE_PASSWORD) for staging deployments.
 * 2. Markdown for agents: `/about.md`, or `/about` with `Accept: text/markdown`,
 *    is rewritten to /api/agent-markdown/about.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const password = process.env.SITE_PASSWORD
  if (password && !BASIC_AUTH_EXCLUDED.some((pattern) => pattern.test(pathname))) {
    const username = process.env.SITE_USERNAME || 'preview'
    if (!isAuthorized(request.headers.get('authorization'), { username, password })) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Preview", charset="UTF-8"' },
      })
    }
  }

  if (pathname.endsWith('.md') && isMarkdownEligiblePath(pathname.slice(0, -3))) {
    return rewriteToMarkdown(request, pathname.slice(0, -3))
  }

  if (isMarkdownEligiblePath(pathname)) {
    if (prefersMarkdown(request.headers.get('accept'))) return rewriteToMarkdown(request, pathname)
    const response = NextResponse.next()
    response.headers.set('Vary', 'Accept')
    return response
  }

  return NextResponse.next()
}

function rewriteToMarkdown(request: NextRequest, path: string) {
  const url = request.nextUrl.clone()
  url.pathname = `/api/agent-markdown${path === '/' ? '' : path}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Everything except Next internals and static assets. Text/XML/JSON routes
    // (llms.txt, sitemap.xml, openapi.json) stay matched so basic auth covers them.
    '/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|woff2?)$).*)',
  ],
}
