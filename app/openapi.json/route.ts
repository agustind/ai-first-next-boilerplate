import { buildOpenApi } from '@/features/agents/openapi'
import { getContentSource } from '@/features/cms'
import { siteUrl } from '@/features/site/url'

export async function GET() {
  const settings = await getContentSource().getSettings()
  return Response.json(buildOpenApi({ siteUrl, siteName: settings.siteName }))
}
