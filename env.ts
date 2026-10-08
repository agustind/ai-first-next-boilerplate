import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

const flag = (fallback: 'true' | 'false') =>
  z
    .enum(['true', 'false', '1', '0'])
    .default(fallback)
    .transform((value) => value === 'true' || value === '1')

/**
 * Typed, validated environment. Every variable is documented in `.env.example`.
 * Import `env` instead of reading `process.env` directly.
 */
export const env = createEnv({
  server: {
    CMS_PROVIDER: z.enum(['sanity', 'directus', 'demo']).optional(),

    SANITY_API_READ_TOKEN: z.string().optional(),
    SANITY_API_WRITE_TOKEN: z.string().optional(),

    DIRECTUS_URL: z.url().optional(),
    DIRECTUS_TOKEN: z.string().optional(),

    REVALIDATE_SECRET: z.string().min(16).optional(),

    SITE_USERNAME: z.string().default('preview'),
    SITE_PASSWORD: z.string().optional(),

    RESEND_API_KEY: z.string().optional(),
    FORMS_NOTIFY_EMAIL: z.email().optional(),
    FORMS_FROM_EMAIL: z.string().optional(),
    TURNSTILE_SECRET_KEY: z.string().optional(),

    AI_TRAINING_CRAWLERS: z.enum(['allow', 'block']).default('allow'),
    PUBLIC_MCP_ENABLED: flag('true'),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().optional(),
    NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
    NEXT_PUBLIC_SANITY_API_VERSION: z.string().default('2026-10-01'),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    NEXT_PUBLIC_UMAMI_SRC: z.url().default('https://cloud.umami.is/script.js'),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_UMAMI_SRC: process.env.NEXT_PUBLIC_UMAMI_SRC,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === '1',
})

export type CmsProvider = 'sanity' | 'directus' | 'demo'

/** Explicit `CMS_PROVIDER` wins; otherwise inferred from which credentials exist. */
export function resolveCmsProvider(): CmsProvider {
  if (env.CMS_PROVIDER) return env.CMS_PROVIDER
  if (env.NEXT_PUBLIC_SANITY_PROJECT_ID) return 'sanity'
  if (env.DIRECTUS_URL) return 'directus'
  return 'demo'
}

/** Vercel-aware: only the production deployment should be indexed. */
export const isProductionDeployment = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production'
