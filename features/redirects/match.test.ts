import { describe, expect, it } from 'vitest'
import { matchRedirect } from './match'

const redirects = [
  { source: '/old-about', destination: '/about', permanent: true },
  { source: '/Promo/', destination: 'https://example.com/promo', permanent: false },
  { source: '/old-blog/*', destination: '/blog/*', permanent: true },
  { source: '/legacy/*', destination: '/', permanent: true },
]

describe('matchRedirect', () => {
  it('matches exact paths ignoring case, trailing slash and query', () => {
    expect(matchRedirect('/old-about/?ref=x', redirects)).toEqual({
      destination: '/about',
      permanent: true,
    })
    expect(matchRedirect('/promo', redirects)).toEqual({
      destination: 'https://example.com/promo',
      permanent: false,
    })
  })

  it('maps wildcard remainders', () => {
    expect(matchRedirect('/old-blog/hello-world', redirects)?.destination).toBe('/blog/hello-world')
    expect(matchRedirect('/legacy/a/b', redirects)?.destination).toBe('/')
  })

  it('does not match partial segments', () => {
    expect(matchRedirect('/old-blogger', redirects)).toBeNull()
    expect(matchRedirect('/nope', redirects)).toBeNull()
  })
})
