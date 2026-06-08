import { describe, expect, it } from 'vitest'

import { buildReposCacheKey, splitFullName } from './github'

describe('splitFullName', () => {
  it('splits owner and repo from a full name', () => {
    expect(splitFullName('my-org/test-repo')).toEqual({
      owner: 'my-org',
      repo: 'test-repo',
    })
  })

  it('returns null when slash is missing', () => {
    expect(splitFullName('invalid')).toBeNull()
  })
})

describe('buildReposCacheKey', () => {
  it('builds a composite cache key', () => {
    expect(buildReposCacheKey('my-org', 2, 'updated', 'desc')).toBe('my-org|2|updated|desc')
  })
})
