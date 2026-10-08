import { Container } from '@/components/container'
import { SmartLink } from '@/components/link'
import { getSiteSettings } from './settings'

export async function SiteFooter() {
  const settings = await getSiteSettings()
  const links = [...settings.footer.links, ...settings.social]
  return (
    <footer className="mt-auto border-border border-t py-12 text-muted-fg text-sm">
      <Container className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <p>
          © <span>{settings.siteName}</span>
          {settings.footer.text ? <> · {settings.footer.text}</> : null}
        </p>
        {links.length > 0 ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                <SmartLink href={link.href} className="hover:text-fg">
                  {link.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </footer>
  )
}
