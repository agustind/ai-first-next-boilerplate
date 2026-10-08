import type { z } from 'zod'
import type { ctaSectionModel } from './model'

export const ctaSectionSample = {
  type: 'ctaSection',
  key: 'sample-cta',
  heading: 'Start your next project today',
  text: 'Clone, rename, ship. Everything else is already wired up.',
  actions: [{ label: 'Contact us', href: '/contact' }],
  tone: 'inverted',
} satisfies z.input<typeof ctaSectionModel>
