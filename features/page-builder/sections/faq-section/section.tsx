import { Container } from '@/components/container'
import { RichText } from '@/features/rich-text/rich-text'
import { headingTag, type SectionProps } from '../../define'
import type { FaqSectionModel } from './model'

/** Native <details>: accessible, no JS, and answers stay in the HTML for crawlers. */
export function FaqSection({ section, index }: SectionProps<FaqSectionModel>) {
  const Heading = headingTag(index)
  return (
    <Container size="prose">
      {section.heading ? (
        <Heading className="mb-8 font-semibold text-3xl tracking-tight sm:text-4xl">
          {section.heading}
        </Heading>
      ) : null}
      <div className="divide-y divide-border border-border border-y">
        {section.items.map((item) => (
          <details key={item.question} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-medium text-lg [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden
                className="text-muted-fg transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <RichText value={item.answer} className="mt-4" />
          </details>
        ))}
      </div>
    </Container>
  )
}
