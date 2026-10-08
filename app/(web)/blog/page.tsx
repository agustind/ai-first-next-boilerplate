import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container } from '@/components/container'
import { PostCard } from '@/features/blog/post-card'
import { type FetchContext, getContentSource, PUBLISHED } from '@/features/cms'
import { getFetchContext, isDraftMode } from '@/features/draft-mode/context'
import { buildMetadata } from '@/features/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContentSource().getSettings(await getFetchContext())
  return buildMetadata({
    title: 'Blog',
    uri: '/blog',
    settings,
    description: `Articles, guides and updates from ${settings.siteName}: how we build fast, accessible, agent-ready websites.`,
  })
}

export default async function BlogPage() {
  if (await isDraftMode()) {
    return (
      <Suspense>
        <DraftPosts />
      </Suspense>
    )
  }
  return <Posts ctx={PUBLISHED} />
}

async function DraftPosts() {
  return <Posts ctx={await getFetchContext()} />
}

async function Posts({ ctx }: { ctx: FetchContext }) {
  const posts = await getContentSource().listPosts(ctx)
  return (
    <Container className="py-16 sm:py-24">
      <h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">Blog</h1>
      {posts.length === 0 ? (
        <p className="mt-8 text-muted-fg">No posts yet.</p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </Container>
  )
}
