import { createMcpHandler } from '@modelcontextprotocol/server'
import { env } from '@/env'
import { createPublicMcpServer } from '@/features/agents/mcp-server'

/**
 * Public read-only MCP endpoint (streamable HTTP, stateless). Connect with:
 *   claude mcp add --transport http site https://your-site.com/api/mcp
 */
const handler = createMcpHandler(() => createPublicMcpServer(), { legacy: 'stateless' })

async function handle(request: Request) {
  if (!env.PUBLIC_MCP_ENABLED) {
    return new Response('Not found', { status: 404 })
  }
  return handler.fetch(request)
}

export { handle as DELETE, handle as GET, handle as POST }
