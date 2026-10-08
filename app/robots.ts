import type { MetadataRoute } from 'next'
import { env, isProductionDeployment } from '@/env'
import { buildRobots } from '@/features/agents/ai-crawlers'
import { siteUrl } from '@/features/site/url'

export default function robots(): MetadataRoute.Robots {
  return buildRobots({
    production: isProductionDeployment,
    trainingCrawlers: env.AI_TRAINING_CRAWLERS,
    siteUrl,
  })
}
