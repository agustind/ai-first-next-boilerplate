import { describe, expect, it } from 'vitest'
import { checkContent, checkHoneypot, checkTiming, verifyTurnstile } from './spam'

describe('spam checks', () => {
  it('rejects a filled honeypot', () => {
    expect(checkHoneypot('http://spam.example')).toEqual({ ok: false, reason: 'honeypot' })
    expect(checkHoneypot('')).toEqual({ ok: true })
    expect(checkHoneypot(null)).toEqual({ ok: true })
  })

  it('rejects forms submitted too fast or without a start time', () => {
    const now = 1_000_000
    expect(checkTiming(now - 500, now).ok).toBe(false)
    expect(checkTiming(undefined, now).ok).toBe(false)
    expect(checkTiming(now - 10_000, now).ok).toBe(true)
  })

  it('rejects link-stuffed messages', () => {
    expect(checkContent('see https://a https://b https://c https://d').ok).toBe(false)
    expect(checkContent('one link https://example.com').ok).toBe(true)
  })

  it('skips Turnstile when not configured', async () => {
    expect(await verifyTurnstile(undefined, undefined)).toEqual({ ok: true })
    expect(await verifyTurnstile('', 'secret')).toEqual({ ok: false, reason: 'turnstile-missing' })
  })
})
