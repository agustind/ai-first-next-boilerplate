'use client'

import NextImage, { type ImageLoader } from 'next/image'
import type { ComponentProps } from 'react'
import type { Image as ImageModel } from '@/features/cms/model'

/**
 * Both supported CMSs transform images on their CDN, so we skip the Next.js
 * optimizer and ask the CDN for the right width/format directly.
 */
const cmsLoader: ImageLoader = ({ src, width, quality }) => {
  const url = new URL(src)
  if (url.hostname === 'cdn.sanity.io') {
    url.searchParams.set('w', String(width))
    url.searchParams.set('q', String(quality ?? 75))
    url.searchParams.set('auto', 'format')
    url.searchParams.set('fit', 'max')
  } else {
    // Directus /assets/<id>
    url.searchParams.set('width', String(width))
    url.searchParams.set('quality', String(quality ?? 75))
    url.searchParams.set('format', 'auto')
  }
  return url.toString()
}

type CmsImageProps = Omit<ComponentProps<typeof NextImage>, 'src' | 'alt' | 'width' | 'height'> & {
  image: ImageModel
  /** Override the CMS alt text (e.g. `""` when the image is decorative next to its caption). */
  alt?: string
}

export function CmsImage({ image, alt, style, fill, ...props }: CmsImageProps) {
  const isRemote = /^https?:\/\//.test(image.src)
  const objectPosition = image.hotspot
    ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%`
    : undefined

  return (
    <NextImage
      src={image.src}
      alt={alt ?? image.alt}
      {...(fill ? { fill } : { width: image.width, height: image.height })}
      loader={isRemote ? cmsLoader : undefined}
      unoptimized={!isRemote && image.src.endsWith('.svg')}
      placeholder={image.blurDataURL ? 'blur' : 'empty'}
      blurDataURL={image.blurDataURL}
      style={{ objectPosition, ...style }}
      {...props}
    />
  )
}
