import { richText } from '@/features/cms/sanity/groq'

export const textSectionQuery = `heading, width, ${richText('body')}`
