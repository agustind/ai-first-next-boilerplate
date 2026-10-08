import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sectionSchema } from '@/features/page-builder/model'
import { PageSections } from '@/features/page-builder/page-sections'
import { sectionDefinitions, sectionRegistry } from '@/features/page-builder/registry'

/**
 * Renders one section with its sample content, isolated. For designing a
 * section, screenshot-testing it, and letting agents check their own work.
 */
export function generateStaticParams() {
  return sectionDefinitions.map((definition) => ({ section: definition.type }))
}

/** Unknown section types get a real 404 instead of a streamed shell. */
export const ensureStatic = 'navigation'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SectionPreviewPage(props: PageProps<'/section-preview/[section]'>) {
  const { section: type } = await props.params
  const definition = sectionRegistry[type as keyof typeof sectionRegistry]
  if (!definition) notFound()
  const section = sectionSchema.parse(definition.sample)
  return <PageSections sections={[section]} />
}
