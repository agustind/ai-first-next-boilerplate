#!/usr/bin/env node
// Rejects commit messages that credit an AI tool as author or co-author.
// Co-Authored-By trailers are what add a bot to a repo's GitHub contributors list.
import { readFileSync } from 'node:fs'

const file = process.argv[2]
if (!file) process.exit(0)

const message = readFileSync(file, 'utf8')
const patterns = [
  /^co-authored-by:.*\b(claude|anthropic|copilot|cursor|codex|openai|gemini|devin|aider)\b/im,
  /^co-authored-by:.*noreply@anthropic\.com/im,
  /^claude-session:/im,
  /generated with \[?claude code/i,
  /🤖 generated with/i,
]

const hit = patterns.find((pattern) => pattern.test(message))
if (hit) {
  console.error(
    '✖ Commit message credits an AI tool. Remove the attribution line and commit again.',
  )
  console.error(`  matched: ${hit}`)
  process.exit(1)
}
