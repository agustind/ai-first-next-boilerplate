import { ButtonLink } from '@/components/button'
import { Container } from '@/components/container'
import { CmsImage } from '@/components/image'
import { cn } from '@/features/style/cn'
import { headingTag, type SectionProps } from '../../define'
import type { HeroSectionModel } from './model'

export function HeroSection({ section, index }: SectionProps<HeroSectionModel>) {
  const Heading = headingTag(index)
  const split = section.layout === 'split' && section.image

  return (
    <Container className={cn('grid gap-12', split ? 'items-center md:grid-cols-2' : 'text-center')}>
      <div className={cn(!split && 'mx-auto max-w-3xl')}>
        {section.eyebrow ? (
          <p className="mb-4 font-medium text-accent text-sm tracking-wide">{section.eyebrow}</p>
        ) : null}
        <Heading className="font-semibold text-4xl tracking-tight sm:text-6xl">
          {section.heading}
        </Heading>
        {section.text ? (
          <p className="mt-6 text-lg text-muted-fg leading-relaxed">{section.text}</p>
        ) : null}
        {section.actions.length > 0 ? (
          <div className={cn('mt-10 flex flex-wrap gap-3', !split && 'justify-center')}>
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
      {section.image ? (
        <CmsImage
          image={section.image}
          preload={index === 0}
          sizes={split ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1152px) 72rem, 100vw'}
          className="h-auto w-full rounded-card"
        />
      ) : null}
    </Container>
  )
}
