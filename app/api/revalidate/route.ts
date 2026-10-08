import { revalidateTag } from 'next/cache'
import { env } from '@/env'
import { DIRECTUS_TAG } from '@/features/cms/directus/adapter'

/**
 * Expire cached content on demand. Sanity doesn't need this (<SanityLive>
 * revalidates automatically); use it for Directus Flows, scripts or CI:
 *
 *   curl -X POST $SITE/api/revalidate -H "Authorization: Bearer $REVALIDATE_SECRET" \
 *        -d '{"tags":["directus"]}'
 */
export async function POST(request: Request) {
  if (
    !env.REVALIDATE_SECRET ||
    request.headers.get('authorization') !== `Bearer ${env.REVALIDATE_SECRET}`
  ) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const body = (await request.json().catch(() => ({}))) as { tags?: unknown }
  const tags =
    Array.isArray(body.tags) && body.tags.length > 0 ? body.tags.map(String) : [DIRECTUS_TAG]
  for (const tag of tags) revalidateTag(tag, 'max')
  return Response.json({ ok: true, revalidated: tags })
}
