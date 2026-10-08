import { CogIcon } from '@sanity/icons/Cog'
import type { StructureResolver } from 'sanity/structure'
import { SETTINGS_ID } from './constants'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('settings').documentId(SETTINGS_ID)),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
      S.divider(),
      S.documentTypeListItem('redirect').title('Redirects'),
      S.documentTypeListItem('formSubmission').title('Form submissions'),
    ])
