'use server'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function disableDraftMode() {
  ;(await draftMode()).disable()
  redirect('/')
}
