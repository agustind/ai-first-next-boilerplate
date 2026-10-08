import { Container } from '@/components/container'
import { env } from '@/env'
import { ContactForm } from '@/features/forms/contact-form'
import { headingTag, type SectionProps } from '../../define'
import type { ContactFormSectionModel } from './model'

export function ContactFormSection({ section, index }: SectionProps<ContactFormSectionModel>) {
  const Heading = headingTag(index)
  return (
    <Container className="grid gap-12 md:grid-cols-[2fr_3fr]">
      <div>
        {section.heading ? (
          <Heading className="font-semibold text-3xl tracking-tight sm:text-4xl">
            {section.heading}
          </Heading>
        ) : null}
        {section.text ? <p className="mt-4 text-lg text-muted-fg">{section.text}</p> : null}
      </div>
      <ContactForm turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
    </Container>
  )
}
