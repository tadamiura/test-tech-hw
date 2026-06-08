/**
 * GitHub repository license (subset of REST API response).
 */
export interface GitHubLicense {
  name: string
}

/**
 * Repository fields used from GET /orgs/{org}/repos.
 */
export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  homepage: string | null
  forks_count: number
  watchers_count: number
  subscribers_count: number
  open_issues_count: number
  language: string | null
  updated_at: string
  license: GitHubLicense | null
}

/**
 * Contributor from GET /repos/{owner}/{repo}/contributors.
 */
export interface Contributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export type RepoSortField = 'updated' | 'created' | 'pushed' | 'full_name'

export type SortDirection = 'asc' | 'desc'

/**
 * UI sort option mapped to GitHub API query parameters.
 */
export interface SortOption {
  label: string
  sort: RepoSortField
  direction: SortDirection
}
