import { parse } from 'node-html-parser'
import { type Finding, fetchWithTimeout, formatFindings, resolveBaseUrl } from './shared'

/**
 * Pure SEO / a11y / agent-readiness rules over one HTML document.
 * `status` is the HTTP status the page was served with.
 */
export function auditHtml(html: string, { status }: { status: number }): Finding[] {
  const findings: Finding[] = []
  const add = (severity: Finding['severity'], message: string) =>
    findings.push({ severity, message })
  const root = parse(html)

  if (status >= 400) add('error', `HTTP ${status}`)
  else if (status >= 300) add('warn', `HTTP ${status} (redirect)`)
  else add('info', `HTTP ${status}`)

  const lang = root.querySelector('html')?.getAttribute('lang')
  if (lang) add('info', `<html lang="${lang}">`)
  else add('error', 'Missing <html lang> attribute')

  const title =
    root.querySelector('head title')?.text.trim() ?? root.querySelector('title')?.text.trim()
  if (!title) add('error', 'Missing <title>')
  else if (title.length > 60)
    add('warn', `<title> is ${title.length} chars (> 60 may be truncated): "${title}"`)
  else add('info', `<title> "${title}" (${title.length} chars)`)

  const description = root
    .querySelector('meta[name="description"]')
    ?.getAttribute('content')
    ?.trim()
  if (!description) add('error', 'Missing meta description')
  else if (description.length < 50 || description.length > 160) {
    add('warn', `Meta description is ${description.length} chars (aim for 50–160)`)
  } else add('info', `Meta description (${description.length} chars)`)

  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href')
  if (!canonical) add('warn', 'Missing <link rel="canonical">')
  else if (!/^https?:\/\//.test(canonical)) add('warn', `Canonical is not absolute: ${canonical}`)
  else add('info', `Canonical ${canonical}`)

  for (const property of ['og:title', 'og:image']) {
    const value = root.querySelector(`meta[property="${property}"]`)?.getAttribute('content')
    if (value) add('info', `${property} present`)
    else add('warn', `Missing ${property}`)
  }

  const h1s = root.querySelectorAll('h1')
  if (h1s.length !== 1) add('error', `Expected exactly one <h1>, found ${h1s.length}`)
  else add('info', `<h1> "${h1s[0]?.text.trim()}"`)

  let previous = 0
  for (const heading of root.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    const level = Number(heading.tagName.slice(1))
    if (previous && level > previous + 1) {
      add(
        'warn',
        `Heading level skips from h${previous} to h${level}: "${heading.text.trim().slice(0, 60)}"`,
      )
    }
    previous = level
  }

  const imagesWithoutAlt = root
    .querySelectorAll('img')
    .filter((img) => img.getAttribute('alt') === undefined)
  if (imagesWithoutAlt.length > 0) {
    add(
      'error',
      `${imagesWithoutAlt.length} <img> without alt: ${imagesWithoutAlt
        .map((i) => i.getAttribute('src'))
        .slice(0, 5)
        .join(', ')}`,
    )
  }

  const emptyLinks = root.querySelectorAll('a[href]').filter((a) => {
    const text = a.text.trim()
    const label = a.getAttribute('aria-label') ?? a.getAttribute('title')
    const imgAlt = a.querySelector('img')?.getAttribute('alt')
    return !text && !label && !imgAlt
  })
  if (emptyLinks.length > 0) {
    add(
      'error',
      `${emptyLinks.length} link(s) without accessible text: ${emptyLinks
        .map((a) => a.getAttribute('href'))
        .slice(0, 5)
        .join(', ')}`,
    )
  }

  const types: string[] = []
  for (const script of root.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent)
      collectTypes(data, types)
    } catch {
      add('error', 'A JSON-LD <script> is not valid JSON')
    }
  }
  if (types.length > 0) add('info', `JSON-LD types: ${[...new Set(types)].join(', ')}`)
  else add('warn', 'No JSON-LD structured data')

  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? ''
  if (/noindex/i.test(robots)) add('warn', `Page is noindex (robots: "${robots}")`)

  const markdownAlternate = root
    .querySelector('link[rel="alternate"][type="text/markdown"]')
    ?.getAttribute('href')
  if (markdownAlternate) add('info', `Markdown alternate ${markdownAlternate}`)
  else
    add(
      'warn',
      'Missing <link rel="alternate" type="text/markdown"> (agents cannot discover the Markdown twin)',
    )

  const sectionErrors = root.querySelectorAll('[data-section-error]')
  if (sectionErrors.length > 0) {
    const detail = sectionErrors
      .map((el) => el.getAttribute('data-section-error'))
      .filter(Boolean)
      .join(', ')
    add(
      'error',
      `CMS section(s) failed validation and were not rendered${detail ? `: ${detail}` : ''}`,
    )
  }

  return findings
}

function collectTypes(value: unknown, types: string[]) {
  if (Array.isArray(value)) {
    for (const item of value) collectTypes(item, types)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  const type = record['@type']
  if (typeof type === 'string') types.push(type)
  else if (Array.isArray(type)) types.push(...type.map(String))
  if (Array.isArray(record['@graph'])) collectTypes(record['@graph'], types)
}

export async function auditPage({ path, baseUrl }: { path: string; baseUrl?: string }) {
  const base = resolveBaseUrl(baseUrl)
  const url = new URL(path, `${base}/`).toString()
  const response = await fetchWithTimeout(url, { headers: { Accept: 'text/html' } })
  const findings = auditHtml(await response.text(), { status: response.status })

  const markdown = await fetchWithTimeout(url, { headers: { Accept: 'text/markdown' } })
  const contentType = markdown.headers.get('content-type') ?? ''
  if (markdown.ok && contentType.includes('text/markdown'))
    add(findings, 'info', 'Markdown twin served via Accept: text/markdown')
  else
    add(
      findings,
      response.ok ? 'warn' : 'info',
      `Markdown twin: HTTP ${markdown.status} ${contentType}`,
    )

  return formatFindings(`Audit ${url}`, findings)
}

function add(findings: Finding[], severity: Finding['severity'], message: string) {
  findings.push({ severity, message })
}
