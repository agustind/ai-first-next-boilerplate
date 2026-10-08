import type { Metadata } from 'next'
import { Suspense } from 'react'
import { JsonLd } from '@/components/json-ld'
import { type FetchContext, getContentSource, PUBLISHED } from '@/features/cms'
import { getFetchContext, isDraftMode } from '@/features/draft-mode/context'
import { PageSections } from '@/features/page-builder/page-sections'
import { redirectOrNotFound } from '@/features/redirects/resolve'
import { buildMetadata } from '@/features/seo/metadata'
import { breadcrumbJsonLd } from '@/features/seo/structured-data'
import { segmentsToUri } from '@/features/site/url'

/**
 * Unlisted URLs (new CMS content, typos, redirects) wait for a complete render
 * instead of streaming the App Shell, so 404s and redirects get real HTTP
 * status codes. Published pages are static either way.
 */
export const ensureStatic = 'navigation'

export async function generateStaticParams() {
  const routes = await getContentSource().listRoutes()
  const params = routes
    .filter((route) => route.type === 'page')
    .map((route) => ({ uri: route.uri === '/' ? [] : route.uri.slice(1).split('/') }))
  // Cache Components requires at least one param to validate the route.
  return params.length > 0 ? params : [{ uri: [] }]
}

export async function generateMetadata(props: PageProps<'/[[...uri]]'>): Promise<Metadata> {
  const uri = segmentsToUri((await props.params).uri)
  const ctx = await getFetchContext()
  const cms = getContentSource()
  const [page, settings] = await Promise.all([cms.getPage(uri, ctx), cms.getSettings(ctx)])
  if (!page) return {}
  return buildMetadata({
    title: page.title,
    uri: page.uri,
    seo: page.seo,
    settings,
    updatedAt: page.updatedAt,
  })
}

export default async function Page(props: PageProps<'/[[...uri]]'>) {
  if (await isDraftMode()) {
    return (
      <Suspense>
        <DraftPage params={props.params} />
      </Suspense>
    )
  }
  return <CmsPage uri={segmentsToUri((await props.params).uri)} ctx={PUBLISHED} />
}

async function DraftPage({ params }: Pick<PageProps<'/[[...uri]]'>, 'params'>) {
  return <CmsPage uri={segmentsToUri((await params).uri)} ctx={await getFetchContext()} />
}

async function CmsPage({ uri, ctx }: { uri: string; ctx: FetchContext }) {
  const page = await getContentSource().getPage(uri, ctx)
  if (!page) return redirectOrNotFound(uri)

  return (
    <>
      <PageSections sections={page.sections} issues={page.sectionIssues} preview={ctx.draft} />
      {uri !== '/' ? (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: page.title, path: uri },
          ])}
        />
      ) : null}
    </>
  )
}
