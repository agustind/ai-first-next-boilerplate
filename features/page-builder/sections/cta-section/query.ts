import { links } from '@/features/cms/sanity/groq'

export const ctaSectionQuery = `heading, text, ${links('actions')}`
