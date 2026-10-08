import { parse } from 'node-html-parser'
import { fetchWithTimeout, mapWithConcurrency, resolveBaseUrl } from './shared'

/** <loc> URLs from a sitemap.xml (urlset or sitemapindex). */
export function parseSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => decodeXml(match[1] ?? ''))
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

/** Same-origin page links (no fragments, no files like .xml/.txt) found in an HTML document. */
export function extractInternalLinks(html: string, pageUrl: string): string[] {
  const origin = new URL(pageUrl).origin
  const links = new Set<string>()
  for (const anchor of parse(html).querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href') ?? ''
    if (!href || href.startsWith('#') || /^(mailto|tel|javascript):/i.test(href)) continue
    let url: URL
    try {
      url = new URL(href, pageUrl)
    } catch {
      continue
    }
    if (url.origin !== origin) continue
    url.hash = ''
    links.add(url.toString())
  }
  return [...links]
}

type PageResult = {
  url: string
  status: number
  title?: string
  description?: string
  sectionError: boolean
  links: string[]
}

/**
 * Crawl the URLs in the sitemap. The sitemap may advertise the production
 * domain (NEXT_PUBLIC_SITE_URL); paths are re-based onto `baseUrl`.
 */
export async function crawlSite({ baseUrl, limit = 50 }: { baseUrl?: string; limit?: number }) {
  const base = resolveBaseUrl(baseUrl)
  const sitemap = await fetchWithTimeout(`${base}/sitemap.xml`)
  if (!sitemap.ok) return `## Crawl ${base}\n\n✖ /sitemap.xml returned HTTP ${sitemap.status}`

  const rebase = (url: string) => {
    const parsed = new URL(url)
    return `${base}${parsed.pathname}${parsed.search}`
  }
  const urls = [...new Set(parseSitemap(await sitemap.text()).map(rebase))].slice(0, limit)

  const pages = await mapWithConcurrency(urls, 4, async (url): Promise<PageResult> => {
    try {
      const response = await fetchWithTimeout(url, { headers: { Accept: 'text/html' } })
      const html = await response.text()
      const root = parse(html)
      return {
        url,
        status: response.status,
        title: root.querySelector('title')?.text.trim() || undefined,
        description:
          root.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ||
          undefined,
        sectionError: root.querySelector('[data-section-error]') !== null,
        links: extractInternalLinks(html, url),
      }
    } catch (error) {
      return {
        url,
        status: 0,
        sectionError: false,
        links: [],
        title: `fetch failed: ${String(error)}`,
      }
    }
  })

  const crawled = new Map(pages.map((page) => [page.url, page.status]))
  const linkSources = new Map<string, string[]>()
  for (const page of pages) {
    for (const link of page.links) {
      if (crawled.has(link)) continue
      linkSources.set(link, [...(linkSources.get(link) ?? []), page.url])
    }
  }
  const linkStatuses = await mapWithConcurrency([...linkSources.keys()], 4, async (link) => {
    try {
      const response = await fetchWithTimeout(link, { method: 'GET' })
      await response.body?.cancel()
      return { link, status: response.status }
    } catch {
      return { link, status: 0 }
    }
  })

  const lines: string[] = [
    `## Crawl ${base}`,
    '',
    `${pages.length} page(s) from sitemap, ${linkStatuses.length} extra internal link(s) checked`,
    '',
  ]
  const problems: string[] = []

  for (const page of pages) {
    if (page.status !== 200) problems.push(`- ✖ HTTP ${page.status} ${page.url}`)
    if (page.sectionError) problems.push(`- ✖ CMS section failed validation on ${page.url}`)
    if (!page.title) problems.push(`- ✖ Missing <title> on ${page.url}`)
    if (!page.description) problems.push(`- ⚠ Missing meta description on ${page.url}`)
  }
  const byTitle = new Map<string, string[]>()
  for (const page of pages)
    if (page.title) byTitle.set(page.title, [...(byTitle.get(page.title) ?? []), page.url])
  for (const [title, urls] of byTitle) {
    if (urls.length > 1) problems.push(`- ⚠ Duplicate title "${title}" on ${urls.join(', ')}`)
  }
  for (const { link, status } of linkStatuses) {
    if (status >= 400 || status === 0) {
      problems.push(
        `- ✖ Broken link ${link} (HTTP ${status}) from ${linkSources.get(link)?.slice(0, 3).join(', ')}`,
      )
    }
  }

  lines.push(...(problems.length > 0 ? problems : ['✓ No problems found']))
  lines.push(
    '',
    '### Pages',
    '',
    ...pages.map((page) => `- ${page.status} ${page.url} — ${page.title ?? '(no title)'}`),
  )
  return lines.join('\n')
}
