import 'server-only'
import { getContentSource } from '@/features/cms'
import { getFetchContext } from '@/features/draft-mode/context'

/** Site settings for the current request (draft-aware). */
export async function getSiteSettings() {
  return getContentSource().getSettings(await getFetchContext())
}
