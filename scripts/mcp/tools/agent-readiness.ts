import { type Finding, fetchWithTimeout, formatFindings, resolveBaseUrl } from './shared'

const MCP_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
  'MCP-Protocol-Version': '2025-06-18',
}

/** JSON-RPC result from a JSON or SSE (`data:` lines) response body. */
export function parseMcpBody(
  body: string,
): { result?: Record<string, unknown>; error?: unknown } | null {
  const trimmed = body.trim()
  const candidates = trimmed.startsWith('{')
    ? [trimmed]
    : trimmed
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch {}
  }
  return null
}

async function mcpCall(base: string, id: number, method: string, params: object) {
  const response = await fetchWithTimeout(`${base}/api/mcp`, {
    method: 'POST',
    headers: MCP_HEADERS,
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  })
  return { status: response.status, body: parseMcpBody(await response.text()) }
}

export async function checkAgentReadiness({ baseUrl }: { baseUrl?: string }) {
  const base = resolveBaseUrl(baseUrl)
  const findings: Finding[] = []
  const ok = (message: string) => findings.push({ severity: 'info', message })
  const fail = (message: string) => findings.push({ severity: 'error', message })

  const get = async (path: string, headers: Record<string, string> = {}) => {
    try {
      const response = await fetchWithTimeout(`${base}${path}`, { headers })
      return {
        status: response.status,
        type: response.headers.get('content-type') ?? '',
        text: await response.text(),
      }
    } catch (error) {
      return { status: 0, type: '', text: String(error) }
    }
  }

  const llms = await get('/llms.txt')
  if (llms.status === 200 && llms.text.startsWith('# ')) ok('/llms.txt is valid (starts with "# ")')
  else
    fail(`/llms.txt: HTTP ${llms.status}${llms.status === 200 ? ', does not start with "# "' : ''}`)

  const robots = await get('/robots.txt')
  if (robots.status === 200 && /^sitemap:/im.test(robots.text)) ok('/robots.txt links a sitemap')
  else if (robots.status === 200)
    findings.push({
      severity: 'warn',
      message: '/robots.txt has no Sitemap line (expected outside production deployments)',
    })
  else fail(`/robots.txt: HTTP ${robots.status}`)
  if (
    /disallow:\s*\/\s*$/im.test(robots.text) &&
    /user-agent:\s*\*/i.test(robots.text) &&
    !/allow:\s*\/\s*$/im.test(robots.text)
  ) {
    findings.push({
      severity: 'warn',
      message: '/robots.txt disallows everything (normal for non-production builds)',
    })
  }

  const sitemap = await get('/sitemap.xml')
  if (sitemap.status === 200 && sitemap.text.includes('<urlset'))
    ok(`/sitemap.xml lists ${(sitemap.text.match(/<loc>/g) ?? []).length} URL(s)`)
  else fail(`/sitemap.xml: HTTP ${sitemap.status}`)

  const feed = await get('/feed.xml')
  if (feed.status === 200 && feed.text.includes('<rss')) ok('/feed.xml is an RSS feed')
  else fail(`/feed.xml: HTTP ${feed.status}`)

  const openapi = await get('/openapi.json')
  try {
    const spec = JSON.parse(openapi.text) as { openapi?: string; paths?: object }
    if (spec.openapi)
      ok(
        `/openapi.json is OpenAPI ${spec.openapi} with ${Object.keys(spec.paths ?? {}).length} path(s)`,
      )
    else fail('/openapi.json has no "openapi" field')
  } catch {
    fail(`/openapi.json: HTTP ${openapi.status}, not valid JSON`)
  }

  const negotiated = await get('/', { Accept: 'text/markdown' })
  if (negotiated.status === 200 && negotiated.type.includes('text/markdown'))
    ok('GET / with Accept: text/markdown returns Markdown')
  else fail(`GET / with Accept: text/markdown → HTTP ${negotiated.status} ${negotiated.type}`)

  const browser = await get('/', { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' })
  if (browser.type.includes('text/html')) ok('Browsers still get HTML on /')
  else fail(`Browser Accept on / returned ${browser.type}`)

  const indexMd = await get('/index.md')
  if (indexMd.status === 200 && indexMd.type.includes('text/markdown'))
    ok('/index.md returns Markdown')
  else fail(`/index.md: HTTP ${indexMd.status} ${indexMd.type}`)

  try {
    const init = await mcpCall(base, 1, 'initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'site-check', version: '1.0.0' },
    })
    const serverInfo = init.body?.result?.serverInfo as { name?: string } | undefined
    if (init.status === 200 && serverInfo) ok(`/api/mcp initialize → server "${serverInfo.name}"`)
    else fail(`/api/mcp initialize: HTTP ${init.status}`)
    const list = await mcpCall(base, 2, 'tools/list', {})
    const tools =
      (list.body?.result?.tools as { name: string }[] | undefined)?.map((tool) => tool.name) ?? []
    if (tools.length > 0) ok(`/api/mcp tools: ${tools.join(', ')}`)
    else fail(`/api/mcp tools/list returned no tools (HTTP ${list.status})`)
  } catch (error) {
    fail(`/api/mcp unreachable: ${String(error)}`)
  }

  return formatFindings(`Agent readiness ${base}`, findings)
}
