import type { z } from 'zod'
import type { mediaSectionModel } from './model'

export const mediaSectionSample = {
  type: 'mediaSection',
  key: 'sample-media',
  image: {
    src: '/placeholders/media.svg',
    alt: 'Layered geometric shapes in soft colours',
    width: 1600,
    height: 800,
  },
  caption: 'Images are served from the CMS CDN in the right size and format.',
  size: 'contained',
} satisfies z.input<typeof mediaSectionModel>
