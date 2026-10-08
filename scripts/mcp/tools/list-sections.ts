import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { repoRoot, resolveBaseUrl } from './shared'

const SECTIONS_DIR = path.join(repoRoot, 'features/page-builder/sections')

export type SectionInfo = { folder: string; type: string }

/** Section types from each folder's model.ts (`type: z.literal('heroSection')`). */
export async function readSections(dir = SECTIONS_DIR): Promise<SectionInfo[]> {
  const folders = (await readdir(dir, { withFileTypes: true })).filter((entry) =>
    entry.isDirectory(),
  )
  const sections: SectionInfo[] = []
  for (const folder of folders) {
    const model = await readFile(path.join(dir, folder.name, 'model.ts'), 'utf8').catch(() => '')
    const type = model.match(/type:\s*z\.literal\(\s*['"]([^'"]+)['"]\s*\)/)?.[1]
    if (type) sections.push({ folder: folder.name, type })
  }
  return sections.sort((a, b) => a.type.localeCompare(b.type))
}

export async function listSections({ baseUrl }: { baseUrl?: string } = {}) {
  const base = resolveBaseUrl(baseUrl)
  const sections = await readSections()
  return [
    `## ${sections.length} section(s)`,
    '',
    ...sections.map(
      (section) =>
        `- \`${section.type}\` — features/page-builder/sections/${section.folder} — ${base}/section-preview/${section.type}`,
    ),
    '',
    `Index: ${base}/section-preview`,
  ].join('\n')
}
