import type { Metadata } from 'next'
import { Suspense, ViewTransition } from 'react'
import { Container } from '@/components/container'
import { CmsImage } from '@/components/image'
import { JsonLd } from '@/components/json-ld'
import { formatDate } from '@/features/blog/format-date'
import { type FetchContext, getContentSource, PUBLISHED } from '@/features/cms'
import { getFetchContext, isDraftMode } from '@/features/draft-mode/context'
import { redirectOrNotFound } from '@/features/redirects/resolve'
import { RichText } from '@/features/rich-text/rich-text'
import { buildMetadata } from '@/features/seo/metadata'
import { articleJsonLd, breadcrumbJsonLd } from '@/features/seo/structured-data'

/**
 * Unlisted URLs (new CMS content, typos, redirects) wait for a complete render
 * instead of streaming the App Shell, so 404s and redirects get real HTTP
 * status codes. Published pages are static either way.
 */
export const ensureStatic = 'navigation'

export async function generateStaticParams() {
  const routes = await getContentSource().listRoutes()
  const params = routes
    .filter((route) => route.type === 'post')
    .map((route) => ({ slug: route.uri.replace('/blog/', '') }))
  return params.length > 0 ? params : [{ slug: 'hello-world' }]
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const ctx = await getFetchContext()
  const cms = getContentSource()
  const [post, settings] = await Promise.all([cms.getPost(slug, ctx), cms.getSettings(ctx)])
  if (!post) return {}
  return buildMetadata({
    title: post.title,
    uri: `/blog/${post.slug}`,
    seo: post.seo,
    settings,
    description: post.excerpt,
    image: post.image,
    type: 'article',
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  })
}

export default async function PostPage(props: PageProps<'/blog/[slug]'>) {
  if (await isDraftMode()) {
    return (
      <Suspense>
        <DraftPost params={props.params} />
      </Suspense>
    )
  }
  return <Post slug={(await props.params).slug} ctx={PUBLISHED} />
}

async function DraftPost({ params }: Pick<PageProps<'/blog/[slug]'>, 'params'>) {
  return <Post slug={(await params).slug} ctx={await getFetchContext()} />
}

async function Post({ slug, ctx }: { slug: string; ctx: FetchContext }) {
  const post = await getContentSource().getPost(slug, ctx)
  if (!post) return redirectOrNotFound(`/blog/${slug}`)

  return (
    <article className="py-16 sm:py-24">
      <Container size="prose">
        <p className="text-muted-fg text-sm">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.author ? ` · ${post.author.name}` : null}
        </p>
        <h1 className="mt-3 font-semibold text-4xl tracking-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt ? (
          <p className="mt-6 text-muted-fg text-xl leading-relaxed">{post.excerpt}</p>
        ) : null}
      </Container>
      {post.image ? (
        <Container className="mt-12">
          <ViewTransition name={`post-image-${post.slug}`} share="morph" default="none">
            <CmsImage
              image={post.image}
              preload
              sizes="(min-width: 1152px) 72rem, 100vw"
              className="aspect-[16/9] w-full rounded-card object-cover"
            />
          </ViewTransition>
        </Container>
      ) : null}
      <Container size="prose" className="mt-12">
        <RichText value={post.body} className="prose-lg" />
      </Container>
      <JsonLd
        data={[
          articleJsonLd(post),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
    </article>
  )
}
