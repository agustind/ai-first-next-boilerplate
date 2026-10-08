import { buildLlmsTxt } from '@/features/agents/llms-txt'
import { getContentSource } from '@/features/cms'
import { siteUrl } from '@/features/site/url'

export async function GET() {
  const cms = getContentSource()
  const [settings, routes] = await Promise.all([cms.getSettings(), cms.listRoutes()])
  return new Response(buildLlmsTxt({ settings, routes, siteUrl }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
