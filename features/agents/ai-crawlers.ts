import type { MetadataRoute } from 'next'

/**
 * AI user agents, split by purpose. Answer/search agents fetch pages to cite
 * them in answers (AEO); blocking them hides the site from AI search.
 * Training crawlers collect data for model training; that's a business call
 * (AI_TRAINING_CRAWLERS=allow|block).
 */
export const AI_ANSWER_AGENTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'DuckAssistBot',
  'MistralAI-User',
] as const

export const AI_TRAINING_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'meta-externalagent',
  'cohere-training-data-crawler',
] as const

/** Never useful in search results or to agents. */
const PRIVATE_PATHS = ['/api/', '/studio', '/section-preview']
/** Agents may read these API routes. */
const AGENT_ALLOWED_PATHS = ['/api/agent-markdown/', '/api/mcp']

export function buildRobots({
  production,
  trainingCrawlers,
  siteUrl,
}: {
  production: boolean
  trainingCrawlers: 'allow' | 'block'
  siteUrl: string
}): MetadataRoute.Robots {
  // Previews and staging must never be indexed.
  if (!production) return { rules: [{ userAgent: '*', disallow: '/' }] }

  const rules: MetadataRoute.Robots['rules'] = [
    { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
    {
      userAgent: [...AI_ANSWER_AGENTS],
      allow: ['/', ...AGENT_ALLOWED_PATHS],
      disallow: PRIVATE_PATHS,
    },
  ]
  if (trainingCrawlers === 'block')
    rules.push({ userAgent: [...AI_TRAINING_CRAWLERS], disallow: '/' })

  return { rules, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl }
}
