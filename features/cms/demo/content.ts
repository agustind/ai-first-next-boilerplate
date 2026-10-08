import { contactFormSectionSample } from '@/features/page-builder/sections/contact-form-section/sample'
import { ctaSectionSample } from '@/features/page-builder/sections/cta-section/sample'
import { faqSectionSample } from '@/features/page-builder/sections/faq-section/sample'
import { featureGridSectionSample } from '@/features/page-builder/sections/feature-grid-section/sample'
import { heroSectionSample } from '@/features/page-builder/sections/hero-section/sample'
import { mediaSectionSample } from '@/features/page-builder/sections/media-section/sample'
import { textSectionSample } from '@/features/page-builder/sections/text-section/sample'
import { paragraphs } from '@/features/rich-text/to-markdown'

/**
 * Built-in content used when no CMS is configured (CMS_PROVIDER=demo). Lets a
 * fresh clone render a real site, and gives CI and agents something to verify.
 * Shapes are raw adapter output: they go through the same validation as CMS data.
 */

const now = '2026-10-01T09:00:00.000Z'

export const demoSettings = {
  siteName: 'Boilerplate',
  description: 'A production-ready, agent-native Next.js + headless CMS starter.',
  navigation: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  footer: {
    text: 'Built with Next.js and a headless CMS.',
    links: [
      { label: 'llms.txt', href: '/llms.txt' },
      { label: 'RSS', href: '/feed.xml' },
      { label: 'Sitemap', href: '/sitemap.xml' },
    ],
  },
  social: [{ label: 'GitHub', href: 'https://github.com' }],
}

export const demoPages = [
  {
    id: 'demo-home',
    title: 'Home',
    uri: '/',
    seo: { title: 'Agent-native Next.js boilerplate', description: demoSettings.description },
    sections: [
      heroSectionSample,
      { ...featureGridSectionSample, anchor: 'get-started' },
      mediaSectionSample,
      faqSectionSample,
      ctaSectionSample,
    ],
    updatedAt: now,
  },
  {
    id: 'demo-about',
    title: 'About',
    uri: '/about',
    seo: { description: 'Why this boilerplate exists and how it is put together.' },
    sections: [
      { ...textSectionSample, key: 'about-intro', heading: 'About this boilerplate' },
      {
        ...textSectionSample,
        key: 'about-principles',
        heading: 'Principles',
        body: paragraphs(
          'Production-ready from day one: SEO, redirects, forms, previews and quality gates are not afterthoughts.',
          'Agent-native: the codebase ships with instructions, skills and an MCP server so AI agents can build and verify their own work, and the live site exposes Markdown, llms.txt and MCP so agents can use it.',
        ),
      },
    ],
    updatedAt: now,
  },
  {
    id: 'demo-contact',
    title: 'Contact',
    uri: '/contact',
    seo: {
      description:
        'Tell us about your project and we will get back to you within one business day.',
    },
    sections: [{ ...contactFormSectionSample, key: 'contact-form' }],
    updatedAt: now,
  },
]

const author = { name: 'Ada Example', role: 'Engineering' }

export const demoPosts = [
  {
    id: 'demo-post-schema',
    title: 'Schema as a system',
    slug: 'schema-as-a-system',
    excerpt:
      'One folder per section keeps the CMS schema, query, component and content model in lockstep.',
    image: {
      src: '/placeholders/media.svg',
      alt: 'Layered geometric shapes',
      width: 1600,
      height: 800,
    },
    publishedAt: '2026-09-20T09:00:00.000Z',
    updatedAt: now,
    author,
    categories: [{ title: 'Architecture', slug: 'architecture' }],
    body: paragraphs(
      'Most CMS projects drift: the schema says one thing, the query another and the component a third. This boilerplate keeps every layer of a section in a single folder and validates CMS output against a typed content model before it reaches React.',
      'Adding a section is one command. Removing one is deleting a folder and a few registry lines, and a test tells you if you missed one.',
    ),
    seo: {},
  },
  {
    id: 'demo-post-agents',
    title: 'Making a website agent-ready',
    slug: 'agent-ready-websites',
    excerpt:
      'Markdown on request, llms.txt, OpenAPI and MCP: what it takes for AI agents to use your site.',
    image: { src: '/placeholders/hero.svg', alt: 'Abstract gradient', width: 1600, height: 900 },
    publishedAt: '2026-09-28T09:00:00.000Z',
    updatedAt: now,
    author,
    categories: [{ title: 'Agents', slug: 'agents' }],
    body: paragraphs(
      'Agents read the web differently. They prefer Markdown to HTML, want a map of what exists and benefit from structured ways to act.',
      'Every page here is available as Markdown by sending Accept: text/markdown or appending .md, listed in /llms.txt, and readable through the MCP endpoint at /api/mcp.',
    ),
    seo: {},
  },
]

export const demoRedirects = [{ source: '/home', destination: '/', permanent: true }]
