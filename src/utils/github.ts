import type { RepoSortField, SortDirection } from '@/types/github'

export function splitFullName(fullName: string): { owner: string; repo: string } | null {
  const slashIndex = fullName.indexOf('/')
  if (slashIndex === -1) {
    return null
  }

  return {
    owner: fullName.slice(0, slashIndex),
    repo: fullName.slice(slashIndex + 1),
  }
}

export function buildReposCacheKey(
  org: string,
  page: number,
  sort: RepoSortField,
  direction: SortDirection,
): string {
  return `${org}|${page}|${sort}|${direction}`
}
