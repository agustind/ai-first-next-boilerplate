import { VisualEditing } from 'next-sanity/visual-editing'
import { resolveCmsProvider } from '@/env'
import { isSanityConfigured } from '@/features/cms/sanity/config'
import { getLive } from '@/features/cms/sanity/live'
import { disableDraftMode } from './actions'
import { isDraftMode } from './context'

/**
 * Live content + visual editing. With Sanity, <SanityLive> keeps cached pages
 * fresh for everyone; in draft mode it streams drafts and VisualEditing adds
 * click-to-edit overlays. Other CMSs get a plain "exit preview" bar.
 */
export async function LiveContent() {
  const draft = await isDraftMode()
  const sanity = resolveCmsProvider() === 'sanity' && isSanityConfigured

  if (!sanity) return draft ? <PreviewBar /> : null

  const { SanityLive } = getLive()
  return (
    <>
      <SanityLive includeDrafts={draft} />
      {draft ? <VisualEditing /> : null}
      {draft ? <PreviewBar /> : null}
    </>
  )
}

function PreviewBar() {
  return (
    <form
      action={disableDraftMode}
      className="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-full bg-fg px-4 py-2 text-bg text-sm shadow-lg"
    >
      Preview mode
      <button type="submit" className="underline underline-offset-4">
        Exit
      </button>
    </form>
  )
}
