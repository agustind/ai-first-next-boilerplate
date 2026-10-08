import type { ComponentProps } from 'react'
import { cn } from '@/features/style/cn'
import { SmartLink } from './link'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent/90',
  secondary: 'bg-bg text-fg ring-1 ring-border ring-inset hover:bg-muted',
  ghost: 'text-fg hover:bg-muted',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: Variant
  size?: Size
  className?: string
} = {}) {
  return cn(base, variants[variant], sizes[size], className)
}

type ButtonProps = ComponentProps<'button'> & { variant?: Variant; size?: Size }

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />
}

type ButtonLinkProps = Omit<ComponentProps<typeof SmartLink>, 'className'> & {
  variant?: Variant
  size?: Size
  className?: string
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <SmartLink className={buttonClasses({ variant, size, className })} {...props} />
}
