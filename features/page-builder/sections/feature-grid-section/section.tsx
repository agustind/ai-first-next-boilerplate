import { Container } from '@/components/container'
import { headingTag, type SectionProps } from '../../define'
import type { FeatureGridSectionModel } from './model'

export function FeatureGridSection({ section, index }: SectionProps<FeatureGridSectionModel>) {
  const Heading = headingTag(index)
  return (
    <Container>
      {section.heading || section.intro ? (
        <div className="mb-12 max-w-2xl">
          {section.heading ? (
            <Heading className="font-semibold text-3xl tracking-tight sm:text-4xl">
              {section.heading}
            </Heading>
          ) : null}
          {section.intro ? <p className="mt-4 text-lg text-muted-fg">{section.intro}</p> : null}
        </div>
      ) : null}
      <ul className="grid gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item) => (
          <li key={item.title} className="bg-bg p-8">
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="mt-2 text-muted-fg leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ul>
    </Container>
  )
}
