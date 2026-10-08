import { describe, expect, it } from 'vitest'
import { absolutizeLinks } from './markdown'

describe('absolutizeLinks', () => {
  it('prefixes site-relative links and leaves absolute ones', () => {
    expect(absolutizeLinks('[a](/about) [b](https://x.com/y) ![c](/img.png)')).toBe(
      '[a](http://localhost:3000/about) [b](https://x.com/y) ![c](http://localhost:3000/img.png)',
    )
  })
})
