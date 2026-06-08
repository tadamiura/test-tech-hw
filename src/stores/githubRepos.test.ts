import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { Contributor, GitHubRepo } from '@/types/github'

vi.mock('@/services/api/githubApi', () => ({
  listOrgRepos: vi.fn(),
  listContributors: vi.fn(),
}))

import { listContributors, listOrgRepos } from '@/services/api/githubApi'
import { useGitHubReposStore } from './githubRepos'

const mockListOrgRepos = vi.mocked(listOrgRepos)
const mockListContributors = vi.mocked(listContributors)

const sampleRepo: GitHubRepo = {
  id: 1,
  name: 'test-repo',
  full_name: 'my-org/test-repo',
  description: 'A test repo',
  homepage: null,
  forks_count: 0,
  watchers_count: 0,
  subscribers_count: 0,
  open_issues_count: 0,
  language: 'TypeScript',
  updated_at: '2026-06-06T12:00:00.000Z',
  license: null,
}

describe('useGitHubReposStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockListOrgRepos.mockReset()
    mockListContributors.mockReset()
  })

  it('serves repos from cache when revisiting the same page', async () => {
    mockListOrgRepos.mockResolvedValueOnce({
      repos: [sampleRepo],
      hasNext: true,
      hasPrev: false,
    })

    const store = useGitHubReposStore()
    store.org = 'my-org'

    await store.search()
    expect(mockListOrgRepos).toHaveBeenCalledTimes(1)
    expect(store.repos).toEqual([sampleRepo])

    await store.goToPage(2)
    expect(mockListOrgRepos).toHaveBeenCalledTimes(2)

    await store.goToPage(1)
    expect(mockListOrgRepos).toHaveBeenCalledTimes(2)
    expect(store.repos).toEqual([sampleRepo])
  })

  it('fetches again when sort changes even for the same page', async () => {
    mockListOrgRepos.mockResolvedValue({
      repos: [sampleRepo],
      hasNext: false,
      hasPrev: false,
    })

    const store = useGitHubReposStore()
    store.org = 'my-org'

    await store.search()
    await store.changeSort({ label: 'Nom (A-Z)', sort: 'full_name', direction: 'asc' })

    expect(mockListOrgRepos).toHaveBeenCalledTimes(2)
  })

  it('serves contributors from cache on second expand', async () => {
    const contributors: Contributor[] = [
      {
        id: 42,
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/42',
        html_url: 'https://github.com/alice',
        contributions: 3,
      },
    ]

    mockListContributors.mockResolvedValueOnce(contributors)

    const store = useGitHubReposStore()

    await store.toggleExpand(sampleRepo)
    await store.toggleExpand(sampleRepo)
    await store.toggleExpand(sampleRepo)

    expect(mockListContributors).toHaveBeenCalledTimes(1)
    expect(store.getContributors('my-org/test-repo')).toEqual(contributors)
  })
})
