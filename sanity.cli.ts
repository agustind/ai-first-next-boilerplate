import { fileURLToPath } from 'node:url'
import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export default defineCliConfig({
  api: { projectId, dataset },
  // Mirror the `@/*` path alias from tsconfig.json for the Studio's Vite build.
  vite: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias as object),
        '@': fileURLToPath(new URL('./', import.meta.url)),
      },
    },
  }),
})
