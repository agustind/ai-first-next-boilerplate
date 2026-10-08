import Link from 'next/link'
import { Container } from '@/components/container'
import { SmartLink } from '@/components/link'
import { getSiteSettings } from './settings'

export async function SiteHeader() {
  const settings = await getSiteSettings()
  return (
    <header
      className="sticky top-0 z-40 border-border/60 border-b bg-bg/80 backdrop-blur-md"
      style={{ viewTransitionName: 'site-header' }}
    >
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="font-semibold tracking-tight">
          {settings.siteName}
        </Link>
        {settings.navigation.length > 0 ? (
          <nav aria-label="Main">
            <ul className="flex items-center gap-1 text-sm">
              {settings.navigation.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <SmartLink
                    href={link.href}
                    className="rounded-full px-3 py-2 text-muted-fg transition-colors hover:text-fg"
                  >
                    {link.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>
    </header>
  )
}

export function SiteHeaderFallback() {
  return <div className="h-16 border-border/60 border-b" />
}
