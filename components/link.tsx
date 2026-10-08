import type { Route } from 'next'
import NextLink from 'next/link'
import type { ComponentProps } from 'react'

export function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

type SmartLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string }

/**
 * One link component for CMS-driven hrefs: internal paths use `next/link`
 * (prefetching, client navigation); absolute URLs open in a new tab.
 */
export function SmartLink({ href, children, ...props }: SmartLinkProps) {
  if (isExternalHref(href)) {
    const newTab = href.startsWith('http')
    return (
      <a
        href={href}
        {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...props}
      >
        {children}
      </a>
    )
  }
  return (
    <NextLink href={href as Route} {...props}>
      {children}
    </NextLink>
  )
}
