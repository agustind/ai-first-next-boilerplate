import type { ComponentProps } from 'react'
import { cn } from '@/features/style/cn'

type ContainerProps = ComponentProps<'div'> & { size?: 'content' | 'prose' }

export function Container({ size = 'content', className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-5 sm:px-8',
        size === 'content' ? 'max-w-content' : 'max-w-prose',
        className,
      )}
      {...props}
    />
  )
}
