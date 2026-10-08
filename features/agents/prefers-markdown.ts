/**
 * Content negotiation for agents. True when the Accept header ranks
 * text/markdown at least as high as text/html. Browsers never list markdown,
 * so they always get HTML.
 */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false
  let markdown = -1
  let html = -1
  for (const part of accept.split(',')) {
    const [type = '', ...params] = part.trim().toLowerCase().split(';')
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='))
    const q = qParam ? Number(qParam.slice(2)) : 1
    if (Number.isNaN(q)) continue
    if (type === 'text/markdown' || type === 'text/x-markdown') markdown = Math.max(markdown, q)
    if (type === 'text/html') html = Math.max(html, q)
  }
  return markdown > 0 && markdown >= html
}

/** Paths that have a Markdown twin (pages and posts, not assets/APIs/studio). */
export function isMarkdownEligiblePath(pathname: string) {
  if (/^\/(api|studio|section-preview|_next)(\/|$)/.test(pathname)) return false
  // Files like /llms.txt, /feed.xml, /image.png are served as-is.
  return !/\.[a-z0-9]+$/i.test(pathname)
}
