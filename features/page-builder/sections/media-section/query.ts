import { image } from '@/features/cms/sanity/groq'

export const mediaSectionQuery = `caption, size, ${image('image')}`
