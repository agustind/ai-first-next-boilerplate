import 'server-only'
import { getContentSource } from '@/features/cms'
import type { Page, Post } from '@/features/cms/model'
import { getSectionDefinition } from '@/features/page-builder/registry'
import { richTextToMarkdown } from '@/features/rich-text/to-markdown'
import { absoluteUrl } from '@/features/site/url'

function frontmatter(fields: Record<string, string | undefined>) {
  const lines = Object.entries(fields)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  return `---\n${lines.join('\n')}\n---`
}

export function pageToMarkdown(page: Page) {
  const body = page.sections
    .map((section) => getSectionDefinition(section.type).toMarkdown(section as never))
    .filter(Boolean)
    .join('\n\n')
  const hasH1 = /^# /m.test(body)
  return [
    frontmatter({
      title: page.seo.title ?? page.title,
      description: page.seo.description,
      url: absoluteUrl(page.uri),
      updated: page.updatedAt,
    }),
    hasH1 ? '' : `# ${page.title}`,
    body,
  ]
    .filter(Boolean)
    .join('\n\n')
}

export function postToMarkdown(post: Post) {
  return [
    frontmatter({
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(`/blog/${post.slug}`),
      author: post.author?.name,
      published: post.publishedAt,
      updated: post.updatedAt,
    }),
    `# ${post.title}`,
    post.excerpt ? `> ${post.excerpt}` : '',
    richTextToMarkdown(post.body),
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Agents often read Markdown out of context: make site-relative links absolute. */
export function absolutizeLinks(markdown: string) {
  return markdown.replace(/\]\((\/[^)\s]*)\)/g, (_match, path: string) => `](${absoluteUrl(path)})`)
}

/** Markdown for any routable URI (published content), or null when nothing lives there. */
export async function documentToMarkdown(uri: string): Promise<string | null> {
  const markdown = await renderMarkdown(uri)
  return markdown === null ? null : absolutizeLinks(markdown)
}

async function renderMarkdown(uri: string): Promise<string | null> {
  const cms = getContentSource()
  const postSlug = uri.match(/^\/blog\/([^/]+)$/)?.[1]
  if (postSlug) {
    const post = await cms.getPost(postSlug)
    return post ? postToMarkdown(post) : null
  }
  if (uri === '/blog') {
    const posts = await cms.listPosts()
    return [
      '# Blog',
      ...posts.map(
        (post) =>
          `- [${post.title}](${absoluteUrl(`/blog/${post.slug}.md`)})${post.excerpt ? `: ${post.excerpt}` : ''}`,
      ),
    ].join('\n\n')
  }
  const page = await cms.getPage(uri)
  return page ? pageToMarkdown(page) : null
}
