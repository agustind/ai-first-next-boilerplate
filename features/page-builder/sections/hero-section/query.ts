import { image, links } from '@/features/cms/sanity/groq'

export const heroSectionQuery = `eyebrow, heading, text, layout, ${image('image')}, ${links('actions')}`
