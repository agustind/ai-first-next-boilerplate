import { spawn } from 'node:child_process'
import { repoRoot } from './shared'

export const CHECKS = ['lint', 'typecheck', 'test', 'knip'] as const
export type Check = (typeof CHECKS)[number]

function runScript(script: Check): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn('npm', ['run', '--silent', script], {
      cwd: repoRoot,
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', CI: '1' },
      shell: process.platform === 'win32',
    })
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
    })
    child.stderr.on('data', (chunk) => {
      output += chunk
    })
    child.on('close', (code) => resolve({ code: code ?? 1, output }))
    child.on('error', (error) => resolve({ code: 1, output: String(error) }))
  })
}

const tail = (text: string, lines = 60) => text.trimEnd().split('\n').slice(-lines).join('\n')

/** Run the repo's quality gates sequentially (they share caches) and summarise. */
export async function runChecks({ checks = [...CHECKS] }: { checks?: Check[] } = {}) {
  const results: { check: Check; ok: boolean; output: string }[] = []
  for (const check of checks) {
    const { code, output } = await runScript(check)
    results.push({ check, ok: code === 0, output })
  }
  const summary = results.map((r) => `- ${r.ok ? '✓' : '✖'} ${r.check}`).join('\n')
  const details = results
    .filter((r) => !r.ok)
    .map((r) => `### ${r.check} failed\n\n\`\`\`\n${tail(r.output)}\n\`\`\``)
    .join('\n\n')
  const passed = results.every((r) => r.ok)
  return {
    passed,
    text: [
      `## Checks: ${passed ? 'all passed' : 'FAILED'}`,
      '',
      summary,
      details ? `\n${details}` : '',
    ].join('\n'),
  }
}
