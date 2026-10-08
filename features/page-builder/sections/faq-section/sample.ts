import type { z } from 'zod'
import { paragraphs } from '@/features/rich-text/to-markdown'
import type { faqSectionModel } from './model'

export const faqSectionSample = {
  type: 'faqSection',
  key: 'sample-faq',
  heading: 'Frequently asked questions',
  items: [
    {
      question: 'Do I need a CMS account to start?',
      answer: paragraphs(
        'No. Without credentials the site runs on built-in demo content. Connect Sanity or Directus when you are ready.',
      ),
    },
    {
      question: 'Can AI agents read this site?',
      answer: paragraphs(
        'Yes. Every page is available as Markdown, listed in /llms.txt, described in /openapi.json and queryable over MCP at /api/mcp.',
      ),
    },
    {
      question: 'How do I add a new section type?',
      answer: paragraphs(
        'Run npm run new:section. It scaffolds the model, CMS schema, query, component, sample and Markdown export, and registers them everywhere.',
      ),
    },
  ],
} satisfies z.input<typeof faqSectionModel>
