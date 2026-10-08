import { fileURLToPath } from 'node:url'

/** Repository root (scripts/mcp/tools → ../../../). */
export const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))

export type Severity = 'error' | 'warn' | 'info'
export type Finding = { severity: Severity; message: string }

/** Where the site under test runs. Override per call or with SITE_CHECK_URL. */
export function resolveBaseUrl(baseUrl?: string) {
  return (baseUrl ?? process.env.SITE_CHECK_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 15_000) {
  return fetch(url, { redirect: 'manual', ...init, signal: AbortSignal.timeout(timeoutMs) })
}

const ICON: Record<Severity, string> = { error: '✖', warn: '⚠', info: '✓' }

export function formatFindings(title: string, findings: Finding[]) {
  const errors = findings.filter((f) => f.severity === 'error').length
  const warnings = findings.filter((f) => f.severity === 'warn').length
  const lines = findings
    .sort((a, b) => order(a.severity) - order(b.severity))
    .map((f) => `- ${ICON[f.severity]} **${f.severity}** ${f.message}`)
  return [`## ${title}`, '', `${errors} error(s), ${warnings} warning(s)`, '', ...lines].join('\n')
}

function order(severity: Severity) {
  return severity === 'error' ? 0 : severity === 'warn' ? 1 : 2
}

/** Run async work over items with bounded concurrency. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
) {
  const results: R[] = new Array(items.length)
  let next = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++
      results[index] = await fn(items[index] as T)
    }
  })
  await Promise.all(workers)
  return results
}
