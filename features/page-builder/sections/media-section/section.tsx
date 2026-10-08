import { Container } from '@/components/container'
import { CmsImage } from '@/components/image'
import { cn } from '@/features/style/cn'
import type { SectionProps } from '../../define'
import type { MediaSectionModel } from './model'

export function MediaSection({ section, index }: SectionProps<MediaSectionModel>) {
  const full = section.size === 'full'
  const figure = (
    <figure>
      <CmsImage
        image={section.image}
        preload={index === 0}
        sizes={full ? '100vw' : '(min-width: 1152px) 72rem, 100vw'}
        className={cn('h-auto w-full', !full && 'rounded-card')}
      />
      {section.caption ? (
        <figcaption className={cn('mt-3 text-muted-fg text-sm', full && 'px-5 sm:px-8')}>
          {section.caption}
        </figcaption>
      ) : null}
    </figure>
  )
  return full ? figure : <Container>{figure}</Container>
}
