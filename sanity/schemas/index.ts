import { formSubmissionType } from './documents/form-submission'
import { pageType } from './documents/page'
import { postType } from './documents/post'
import { redirectType } from './documents/redirect'
import { settingsType } from './documents/settings'
import { authorType, categoryType } from './documents/taxonomy'
import { linkType } from './objects/link'
import { seoType } from './objects/seo'
import { sectionSchemas } from './sections'

export const schemaTypes = [
  // documents
  pageType,
  postType,
  authorType,
  categoryType,
  settingsType,
  redirectType,
  formSubmissionType,
  // objects
  linkType,
  seoType,
  ...sectionSchemas,
]
