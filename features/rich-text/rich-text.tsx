import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { CmsImage } from '@/components/image'
import { SmartLink } from '@/components/link'
import { imageSchema, type RichText as RichTextModel } from '@/features/cms/model'
import { cn } from '@/features/style/cn'

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const parsed = imageSchema.safeParse(value.image)
      if (!parsed.success) return null
      return (
        <figure>
          <CmsImage
            image={parsed.data}
            sizes="(min-width: 768px) 44rem, 100vw"
            className="rounded-xl"
          />
          {typeof value.caption === 'string' && value.caption ? (
            <figcaption>{value.caption}</figcaption>
          ) : null}
        </figure>
      )
    },
  },
  marks: {
    link: ({ value, children }) =>
      typeof value?.href === 'string' ? (
        <SmartLink href={value.href}>{children}</SmartLink>
      ) : (
        children
      ),
  },
}

export function RichText({ value, className }: { value: RichTextModel; className?: string }) {
  const classes = cn('prose prose-neutral dark:prose-invert max-w-none', className)

  if (value.format === 'html') {
    // Directus WYSIWYG output. Trusted: only authenticated editors can write it.
    // biome-ignore lint/security/noDangerouslySetInnerHtml: editor-authored CMS HTML
    return <div className={classes} dangerouslySetInnerHTML={{ __html: value.html }} />
  }

  return (
    <div className={classes}>
      <PortableText value={value.blocks} components={components} />
    </div>
  )
}
