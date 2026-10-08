import { ButtonLink } from '@/components/button'
import { Container } from '@/components/container'
import { headingTag, type SectionProps } from '../../define'
import type { CtaSectionModel } from './model'

export function CtaSection({ section, index }: SectionProps<CtaSectionModel>) {
  const Heading = headingTag(index)
  return (
    <Container>
      <div className="flex flex-col items-start justify-between gap-8 rounded-card border border-border p-8 sm:p-12 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <Heading className="font-semibold text-3xl tracking-tight">{section.heading}</Heading>
          {section.text ? <p className="mt-3 text-lg text-muted-fg">{section.text}</p> : null}
        </div>
        {section.actions.length > 0 ? (
          <div className="flex shrink-0 flex-wrap gap-3">
            {section.actions.map((action, i) => (
              <ButtonLink
                key={`${action.href}-${action.label}`}
                href={action.href}
                variant={i === 0 ? 'primary' : 'secondary'}
                size="lg"
              >
                {action.label}
              </ButtonLink>
            ))}
          </div>
        ) : null}
      </div>
    </Container>
  )
}
