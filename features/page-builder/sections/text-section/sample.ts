import type { z } from 'zod'
import { paragraphs } from '@/features/rich-text/to-markdown'
import type { textSectionModel } from './model'

export const textSectionSample = {
  type: 'textSection',
  key: 'sample-text',
  heading: 'Schema as a system',
  body: paragraphs(
    'Every section lives in one folder: its content model, CMS schema, query, component, sample data and Markdown export. Add a section with one command and every layer stays in sync.',
    'The frontend never sees raw CMS documents. Adapters project content into a validated model, so you can switch CMS without touching a single component.',
  ),
  width: 'narrow',
} satisfies z.input<typeof textSectionModel>
