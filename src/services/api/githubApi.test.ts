import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Contributor, GitHubRepo } from '@/types/github'

vi.mock('./client', () => ({
  githubClient: {
    get: vi.fn(),
  },
}))

import { githubClient } from './client'
import { listContributors, listOrgRepos, parseLinkHeader } from './githubApi'

const mockGet = vi.mocked(githubClient.get)

const sampleRepo: GitHubRepo = {
  id: 1,
  name: 'test-repo',
  full_name: 'my-org/test-repo',
  description: 'A test repo',
  homepage: 'https://example.com',
  forks_count: 3,
  watchers_count: 10,
  subscribers_count: 2,
  open_issues_count: 1,
  language: 'TypeScript',
  updated_at: '2026-06-06T12:00:00.000Z',
  license: { name: 'MIT' },
}

describe('parseLinkHeader', () => {
  it('returns false for both flags when link is undefined', () => {
    expect(parseLinkHeader(undefined)).toEqual({ hasNext: false, hasPrev: false })
  })

  it('returns false for both flags when link is empty', () => {
    expect(parseLinkHeader('')).toEqual({ hasNext: false, hasPrev: false })
  })

  it('detects next and prev relations', () => {
    const link =
      '<https://api.github.com/orgs/my-org/repos?page=2>; rel="next", ' +
      '<https://api.github.com/orgs/my-org/repos?page=1>; rel="prev"'

    expect(parseLinkHeader(link)).toEqual({ hasNext: true, hasPrev: true })
  })

  it('detects only next relation', () => {
    const link = '<https://api.github.com/orgs/my-org/repos?page=2>; rel="next"'

    expect(parseLinkHeader(link)).toEqual({ hasNext: true, hasPrev: false })
  })

  it('detects only prev relation', () => {
    const link = '<https://api.github.com/orgs/my-org/repos?page=1>; rel="prev"'

    expect(parseLinkHeader(link)).toEqual({ hasNext: false, hasPrev: true })
  })
})

describe('listOrgRepos', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('calls the org repos endpoint with default pagination and sort params', async () => {
    mockGet.mockResolvedValueOnce({
      data: [sampleRepo],
      headers: { link: '' },
    })

    const result = await listOrgRepos('my-org')

    expect(mockGet).toHaveBeenCalledWith('/orgs/my-org/repos', {
      params: {
        per_page: 10,
        page: 1,
        sort: 'updated',
        direction: 'desc',
      },
    })
    expect(result.repos).toEqual([sampleRepo])
    expect(result.hasNext).toBe(false)
    expect(result.hasPrev).toBe(false)
  })

  it('passes custom page, sort and direction options', async () => {
    mockGet.mockResolvedValueOnce({
      data: [],
      headers: {},
    })

    await listOrgRepos('my-org', { page: 3, sort: 'full_name', direction: 'asc' })

    expect(mockGet).toHaveBeenCalledWith('/orgs/my-org/repos', {
      params: {
        per_page: 10,
        page: 3,
        sort: 'full_name',
        direction: 'asc',
      },
    })
  })

  it('encodes special characters in org name', async () => {
    mockGet.mockResolvedValueOnce({
      data: [],
      headers: {},
    })

    await listOrgRepos('org/with space')

    expect(mockGet).toHaveBeenCalledWith('/orgs/org%2Fwith%20space/repos', expect.any(Object))
  })

  it('parses Link header for pagination flags', async () => {
    mockGet.mockResolvedValueOnce({
      data: [sampleRepo],
      headers: {
        link: '<https://api.github.com/orgs/my-org/repos?page=2>; rel="next"',
      },
    })

    const result = await listOrgRepos('my-org', { page: 1 })

    expect(result.hasNext).toBe(true)
    expect(result.hasPrev).toBe(false)
  })
})

describe('listContributors', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('calls the contributors endpoint and returns data', async () => {
    const contributors: Contributor[] = [
      {
        id: 42,
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/42',
        html_url: 'https://github.com/alice',
        contributions: 15,
      },
    ]

    mockGet.mockResolvedValueOnce({ data: contributors })

    const result = await listContributors('my-org', 'test-repo')

    expect(mockGet).toHaveBeenCalledWith('/repos/my-org/test-repo/contributors', {
      params: { per_page: 100 },
    })
    expect(result).toEqual(contributors)
  })

  it('encodes owner and repo names', async () => {
    mockGet.mockResolvedValueOnce({ data: [] })

    await listContributors('owner/name', 'repo name')

    expect(mockGet).toHaveBeenCalledWith(
      '/repos/owner%2Fname/repo%20name/contributors',
      expect.any(Object),
    )
  })
})
