import { Container } from '@/components/container'
import { RichText } from '@/features/rich-text/rich-text'
import { headingTag, type SectionProps } from '../../define'
import type { TextSectionModel } from './model'

export function TextSection({ section, index }: SectionProps<TextSectionModel>) {
  const Heading = headingTag(index)
  return (
    <Container size={section.width === 'narrow' ? 'prose' : 'content'}>
      {section.heading ? (
        <Heading className="mb-8 font-semibold text-3xl tracking-tight sm:text-4xl">
          {section.heading}
        </Heading>
      ) : null}
      <RichText value={section.body} className="prose-lg" />
    </Container>
  )
}
