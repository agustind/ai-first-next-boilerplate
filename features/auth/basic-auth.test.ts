import { describe, expect, it } from 'vitest'
import { isAuthorized, parseBasicAuth, safeEqual } from './basic-auth'

const header = (user: string, pass: string) => `Basic ${btoa(`${user}:${pass}`)}`

describe('basic auth', () => {
  it('parses credentials, including colons in the password', () => {
    expect(parseBasicAuth(header('preview', 'a:b'))).toEqual({
      username: 'preview',
      password: 'a:b',
    })
    expect(parseBasicAuth('Bearer x')).toBeNull()
    expect(parseBasicAuth('Basic !!!')).toBeNull()
  })

  it('authorizes only exact matches', () => {
    const expected = { username: 'preview', password: 's3cret' }
    expect(isAuthorized(header('preview', 's3cret'), expected)).toBe(true)
    expect(isAuthorized(header('preview', 's3cre'), expected)).toBe(false)
    expect(isAuthorized(null, expected)).toBe(false)
  })

  it('compares strings of different lengths safely', () => {
    expect(safeEqual('abc', 'abc')).toBe(true)
    expect(safeEqual('abc', 'abcd')).toBe(false)
  })
})
