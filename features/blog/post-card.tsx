import Link from 'next/link'
import { ViewTransition } from 'react'
import { CmsImage } from '@/components/image'
import type { PostSummary } from '@/features/cms/model'
import { formatDate } from './format-date'

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group relative flex flex-col gap-4">
      {post.image ? (
        <ViewTransition name={`post-image-${post.slug}`} share="morph" default="none">
          <CmsImage
            image={post.image}
            alt=""
            sizes="(min-width: 768px) 33vw, 100vw"
            className="aspect-[16/9] w-full rounded-card object-cover"
          />
        </ViewTransition>
      ) : null}
      <div>
        <p className="text-muted-fg text-sm">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {post.categories[0] ? ` · ${post.categories[0].title}` : null}
        </p>
        <h2 className="mt-2 font-semibold text-xl tracking-tight group-hover:text-accent">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="mt-2 text-muted-fg">{post.excerpt}</p> : null}
      </div>
    </article>
  )
}
