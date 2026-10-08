import { richText } from '@/features/cms/sanity/groq'

export const faqSectionQuery = `heading, items[]{ question, ${richText('answer')} }`
