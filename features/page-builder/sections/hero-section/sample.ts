import type { z } from 'zod'
import type { heroSectionModel } from './model'

export const heroSectionSample = {
  type: 'heroSection',
  key: 'sample-hero',
  eyebrow: 'Production-ready from day one',
  heading: 'Ship content-driven sites at the speed of an agent',
  text: 'Next.js, a headless CMS and a schema-first content model, wired for humans and AI agents alike.',
  image: {
    src: '/placeholders/hero.svg',
    alt: 'Abstract gradient illustration',
    width: 1600,
    height: 900,
  },
  actions: [
    { label: 'Get started', href: '/#get-started' },
    { label: 'Read the blog', href: '/blog' },
  ],
  layout: 'centered',
} satisfies z.input<typeof heroSectionModel>
