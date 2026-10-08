/**
 * Clone → rename → ship. Run once after cloning: `npm run init`.
 *
 *   npm run init                                  # interactive
 *   npm run init -- --name acme-site --site-name "Acme" --url https://acme.com --yes
 *
 * Updates package.json, the demo site name and creates .env.local (never
 * overwrites an existing one). Safe to run again.
 */
import { existsSync } from 'node:fs'
import { copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'

const { values: flags } = parseArgs({
  options: {
    name: { type: 'string' },
    'site-name': { type: 'string' },
    url: { type: 'string' },
    yes: { type: 'boolean', short: 'y', default: false },
    cwd: { type: 'string' },
  },
})

const root = path.resolve(flags.cwd ?? process.cwd())
const file = (relative: string) => path.join(root, relative)

export const toPackageName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[-._]+|[-._]+$/g, '')

const SITE_NAME = /siteName: '((?:[^'\\]|\\.)*)'/

/** A single-quoted TS string literal. */
const tsString = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`

function validUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function ask(question: string, fallback: string) {
  if (flags.yes || !process.stdin.isTTY) return fallback
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = (await rl.question(`${question} (${fallback}): `)).trim()
  rl.close()
  return answer || fallback
}

async function main() {
  const pkgPath = file('package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as { name: string }

  const demoPath = file('features/cms/demo/content.ts')
  const demo = existsSync(demoPath) ? await readFile(demoPath, 'utf8') : ''
  const currentSiteName = demo.match(SITE_NAME)?.[1]?.replace(/\\(.)/g, '$1') ?? 'My Site'

  // Defaults are the current values, so re-running is a no-op unless you change something.
  const defaultName = pkg.name === 'ai-first-next-boilerplate' ? path.basename(root) : pkg.name
  const name = toPackageName(flags.name ?? (await ask('Package name', defaultName)))
  if (!name) throw new Error('Package name is empty')
  const siteName = (flags['site-name'] ?? (await ask('Site name', currentSiteName))).trim()
  if (!siteName) throw new Error('Site name is empty')
  const url = (flags.url ?? (await ask('Production URL', 'http://localhost:3000'))).replace(
    /\/$/,
    '',
  )
  if (!validUrl(url)) throw new Error(`Not a valid http(s) URL: ${url}`)

  const done: string[] = []

  if (pkg.name !== name) {
    pkg.name = name
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
    done.push(`package.json name → ${name}`)
  }

  if (demo) {
    const updated = demo.replace(SITE_NAME, () => `siteName: ${tsString(siteName)}`)
    if (updated !== demo) {
      await writeFile(demoPath, updated)
      done.push(`demo site name → ${siteName}`)
    }
  }

  const envPath = file('.env.local')
  if (existsSync(envPath)) {
    done.push('.env.local exists, left untouched')
  } else if (existsSync(file('.env.example'))) {
    await copyFile(file('.env.example'), envPath)
    const env = await readFile(envPath, 'utf8')
    await writeFile(
      envPath,
      env.replace(/^NEXT_PUBLIC_SITE_URL=.*$/m, `NEXT_PUBLIC_SITE_URL=${url}`),
    )
    done.push(`.env.local created (NEXT_PUBLIC_SITE_URL=${url})`)
  }

  console.info(
    [
      '',
      done.length ? done.map((line) => `✓ ${line}`).join('\n') : '✓ Nothing to change',
      '',
      'Next steps:',
      '  npm run dev                                  # runs on demo content, no CMS needed',
      '',
      '  Sanity:   npx sanity@latest init --env .env.local',
      '            npm run sanity:seed               # optional demo content',
      '  Directus: npm run directus:up && npm run directus:bootstrap',
      '',
      '  Then: git remote set-url origin <your-repo> and push.',
      '',
    ].join('\n'),
  )
}

main().catch((error) => {
  console.error(`✖ ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
