import { describe, expect, it } from 'vitest'
import { AI_TRAINING_CRAWLERS, buildRobots } from './ai-crawlers'

const siteUrl = 'https://example.com'

describe('buildRobots', () => {
  it('blocks everything outside production', () => {
    expect(buildRobots({ production: false, trainingCrawlers: 'allow', siteUrl }).rules).toEqual([
      { userAgent: '*', disallow: '/' },
    ])
  })

  it('allows answer agents and links the sitemap in production', () => {
    const robots = buildRobots({ production: true, trainingCrawlers: 'allow', siteUrl })
    expect(robots.sitemap).toBe('https://example.com/sitemap.xml')
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules]
    expect(rules.some((rule) => [rule.userAgent].flat().includes('OAI-SearchBot'))).toBe(true)
    expect(rules.some((rule) => [rule.userAgent].flat().includes('GPTBot'))).toBe(false)
  })

  it('blocks training crawlers when asked', () => {
    const robots = buildRobots({ production: true, trainingCrawlers: 'block', siteUrl })
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules]
    expect(rules.at(-1)).toEqual({ userAgent: [...AI_TRAINING_CRAWLERS], disallow: '/' })
  })
})
