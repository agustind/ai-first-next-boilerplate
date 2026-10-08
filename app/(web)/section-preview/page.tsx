import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { sectionDefinitions } from '@/features/page-builder/registry'

export const metadata: Metadata = {
  title: 'Section previews',
  robots: { index: false, follow: false },
}

export default function SectionPreviewIndex() {
  return (
    <Container className="py-16">
      <h1 className="font-semibold text-3xl tracking-tight">Sections</h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {sectionDefinitions.map((definition) => (
          <li key={definition.type} className="rounded-card border border-border p-5">
            <Link
              href={`/section-preview/${definition.type}`}
              className="font-medium hover:text-accent"
            >
              {definition.title}
            </Link>
            <p className="mt-1 text-muted-fg text-sm">{definition.description}</p>
            <code className="mt-3 block text-muted-fg text-xs">{definition.type}</code>
          </li>
        ))}
      </ul>
    </Container>
  )
}
