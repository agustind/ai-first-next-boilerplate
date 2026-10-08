/**
 * Public Sanity config. Safe to import from the Studio (browser) and server.
 * Read straight from process.env so `sanity.cli.ts` can use it outside Next.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-10-01'
/** The Studio is embedded in this app. */
export const studioUrl = '/studio'

export const isSanityConfigured = projectId !== ''
