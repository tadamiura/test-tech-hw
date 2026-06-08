import { githubClient } from './client'
import type { Contributor, GitHubRepo, RepoSortField, SortDirection } from '@/types/github'

const REPOS_PER_PAGE = 10
const CONTRIBUTORS_PER_PAGE = 100

export interface ListOrgReposOptions {
  page?: number
  sort?: RepoSortField
  direction?: SortDirection
}

export interface ListOrgReposResult {
  repos: GitHubRepo[]
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Parses GitHub's RFC 5988 Link header into pagination flags, for unit testing.
 *
 * Example: `<url>; rel="next", <url>; rel="prev"`
 */
export function parseLinkHeader(link: string | undefined): {
  hasNext: boolean
  hasPrev: boolean
} {
  if (!link) {
    return { hasNext: false, hasPrev: false }
  }

  let hasNext = false
  let hasPrev = false

  for (const part of link.split(',')) {
    // match the rel attribute value (next or prev)
    const relMatch = part.match(/rel="(\w+)"/)
    if (!relMatch) {
      continue
    }

    if (relMatch[1] === 'next') {
      hasNext = true
    } else if (relMatch[1] === 'prev') {
      hasPrev = true
    }
  }

  return { hasNext, hasPrev }
}

/**
 * Lists repositories for a GitHub organization (paginated).
 */
export async function listOrgRepos(
  org: string,
  options: ListOrgReposOptions = {},
): Promise<ListOrgReposResult> {
  const { page = 1, sort = 'updated', direction = 'desc' } = options

  const response = await githubClient.get<GitHubRepo[]>(`/orgs/${encodeURIComponent(org)}/repos`, {
    params: {
      per_page: REPOS_PER_PAGE,
      page,
      sort,
      direction,
    },
  })

  const link = typeof response.headers.link === 'string' ? response.headers.link : undefined
  const { hasNext, hasPrev } = parseLinkHeader(link)

  return {
    repos: response.data,
    hasNext,
    hasPrev,
  }
}

/**
 * Lists contributors for a repository (up to 100 per page).
 */
export async function listContributors(owner: string, repo: string): Promise<Contributor[]> {
  const response = await githubClient.get<Contributor[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`,
    {
      params: {
        per_page: CONTRIBUTORS_PER_PAGE,
      },
    },
  )

  return response.data
}
