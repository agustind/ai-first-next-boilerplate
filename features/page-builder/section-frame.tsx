import type { ReactNode } from 'react'
import { cn } from '@/features/style/cn'
import type { SectionTone } from './define'

/** Outer shell shared by every section: spacing, tone, anchor and a debug hook for agents. */
export function SectionFrame({
  type,
  anchor,
  tone,
  children,
}: {
  type: string
  anchor?: string
  tone: SectionTone
  children: ReactNode
}) {
  return (
    <section
      id={anchor}
      data-section={type}
      className={cn(
        'scroll-mt-24 py-16 sm:py-24',
        tone === 'muted' && 'tone-muted',
        tone === 'inverted' && 'tone-inverted',
      )}
    >
      {children}
    </section>
  )
}
