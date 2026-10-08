import type { z } from 'zod'
import type { featureGridSectionModel } from './model'

export const featureGridSectionSample = {
  type: 'featureGridSection',
  key: 'sample-features',
  heading: 'Everything a new web project needs',
  intro: 'Opinionated defaults you would otherwise rebuild on every project.',
  items: [
    { title: 'Page builder', text: 'Composable sections with live preview and visual editing.' },
    { title: 'SEO & AEO', text: 'Metadata, sitemaps, JSON-LD and answer-engine friendly content.' },
    {
      title: 'Agent-ready',
      text: 'Markdown for every page, llms.txt, OpenAPI and a public MCP endpoint.',
    },
    { title: 'Redirects', text: 'Editor-managed redirects resolved before a 404 is ever served.' },
    {
      title: 'Forms',
      text: 'Validated server actions with spam protection and delivery to the CMS.',
    },
    {
      title: 'Quality gates',
      text: 'Biome, TypeScript, Vitest, Knip and commit hooks out of the box.',
    },
  ],
} satisfies z.input<typeof featureGridSectionModel>
