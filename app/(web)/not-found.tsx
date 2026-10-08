import { ButtonLink } from '@/components/button'
import { Container } from '@/components/container'

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="font-mono text-muted-fg text-sm">404</p>
      <h1 className="mt-3 font-semibold text-4xl tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted-fg">
        The page you are looking for does not exist or has moved.
      </p>
      <ButtonLink href="/" className="mt-8">
        Back home
      </ButtonLink>
    </Container>
  )
}
