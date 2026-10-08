import type { ComponentType } from 'react'
import { z } from 'zod'
import { cleanEnum, cleanString, optional, withDefault } from '@/features/cms/model/primitives'

/** Fields every section shares. Spread into each section model. */
export const sectionBase = {
  key: z.string(),
  /** Optional `id` so other links can target `#anchor`. */
  anchor: optional(cleanString),
  tone: withDefault(cleanEnum(['default', 'muted', 'inverted']), 'default'),
}

export type SectionTone = 'default' | 'muted' | 'inverted'

export interface SectionProps<T> {
  section: T
  /** Position on the page. Index 0 is the first fold: render its heading as `h1`, load images eagerly. */
  index: number
}

export interface SectionDefinition<T extends { type: string }> {
  type: T['type']
  /** Human label (Studio, previews, docs). */
  title: string
  /** One line: when an editor should pick this section. Also shown to agents. */
  description: string
  model: z.ZodType<T>
  component: ComponentType<SectionProps<T>>
  /** Realistic sample content. Drives demo content, /section-preview and tests. */
  sample: z.input<z.ZodType<T>> & { type: T['type'] }
  /** Markdown for agents (/api/agent-markdown, llms.txt, public MCP). */
  toMarkdown: (section: T) => string
  /** Optional structured data contributed by this section (e.g. FAQPage). */
  jsonLd?: (section: T) => Record<string, unknown> | null
}

export function defineSection<T extends { type: string }>(definition: SectionDefinition<T>) {
  return definition
}

/** A heading level that keeps the document outline valid: first section owns the h1. */
export function headingTag(index: number) {
  return index === 0 ? 'h1' : 'h2'
}
