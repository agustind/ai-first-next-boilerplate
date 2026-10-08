import { documentToMarkdown } from '@/features/agents/markdown'
import { segmentsToUri } from '@/features/site/url'

/**
 * Markdown twin of every page. Reached via proxy.ts rewrites:
 * `/about.md` or `/about` with `Accept: text/markdown`.
 */
export async function GET(_request: Request, ctx: RouteContext<'/api/agent-markdown/[[...uri]]'>) {
  const segments = (await ctx.params).uri
  const uri = segments?.join('/') === 'index' ? '/' : segmentsToUri(segments)
  const markdown = await documentToMarkdown(uri)
  if (!markdown) {
    return new Response(
      `# Not found\n\nNothing is published at \`${uri}\`. See /llms.txt for all pages.`,
      {
        status: 404,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      },
    )
  }
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'X-Robots-Tag': 'noindex',
    },
  })
}
