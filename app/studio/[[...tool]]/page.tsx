import { isSanityConfigured } from '@/features/cms/sanity/config'
import { Studio } from './studio'

export function generateStaticParams() {
  return [{ tool: [] }]
}

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main
        style={{
          fontFamily: 'system-ui',
          maxWidth: 560,
          margin: '15vh auto',
          padding: 24,
          lineHeight: 1.6,
        }}
      >
        <h1>Sanity is not configured</h1>
        <p>
          Run <code>npx sanity@latest init --env .env.local</code> to create or link a project, then
          restart <code>npm run dev</code>. See GETTING-STARTED.md.
        </p>
      </main>
    )
  }
  return <Studio />
}
