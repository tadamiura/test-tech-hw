import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { SORT_OPTIONS } from '@/const/sortOptions'
import { listContributors, listOrgRepos } from '@/services/api/githubApi'
import type {
  Contributor,
  GitHubRepo,
  RepoSortField,
  SortDirection,
  SortOption,
} from '@/types/github'
import { buildReposCacheKey, splitFullName } from '@/utils/github'
import { parseReposError } from '@/utils/githubError'
import { formatRateLimitMessage } from '@/utils/rateLimit'

interface ReposPageCache {
  repos: GitHubRepo[]
  hasNext: boolean
  hasPrev: boolean
}

export const useGitHubReposStore = defineStore('githubRepos', () => {
  //State
  const org = ref('')
  const page = ref(1)
  const sort = ref<RepoSortField>('updated')
  const direction = ref<SortDirection>('desc')
  const repos = ref<GitHubRepo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const hasNextPage = ref(false)
  const hasPrevPage = ref(false)
  const rateLimitResetAt = ref<number | null>(null)
  const expandedRepoId = ref<number | null>(null)
  const reposCache = ref(new Map<string, ReposPageCache>())
  const contributorsCache = ref(new Map<string, Contributor[]>())
  const contributorsLoading = ref(new Set<string>())

  // Getters
  const selectedSortOption = computed(() =>
    SORT_OPTIONS.find(
      (option) => option.sort === sort.value && option.direction === direction.value,
    ),
  )

  const rateLimitMessage = computed(() => {
    if (rateLimitResetAt.value === null) {
      return null
    }
    return formatRateLimitMessage(rateLimitResetAt.value)
  })

  const sortSelectValue = computed({
    get: () =>
      String(
        SORT_OPTIONS.findIndex(
          (option) => option.sort === sort.value && option.direction === direction.value,
        ),
      ),
    set: (value: string) => {
      const option = SORT_OPTIONS[Number.parseInt(value, 10)]
      if (option) {
        void changeSort(option)
      }
    },
  })

  // Actions
  function applyReposPageCache(entry: ReposPageCache): void {
    repos.value = entry.repos
    hasNextPage.value = entry.hasNext
    hasPrevPage.value = entry.hasPrev
  }

  function clearReposView(): void {
    repos.value = []
    hasNextPage.value = false
    hasPrevPage.value = false
  }

  function getReposCacheKey(trimmedOrg: string): string {
    return buildReposCacheKey(trimmedOrg, page.value, sort.value, direction.value)
  }

  function validateOrgInput(trimmedOrg: string): boolean {
    if (trimmedOrg) {
      return true
    }

    error.value = "Veuillez saisir le nom d'une organisation."
    clearReposView()
    return false
  }

  function applyReposFromCache(cacheKey: string): boolean {
    const cached = reposCache.value.get(cacheKey)
    if (!cached) {
      return false
    }

    error.value = null
    rateLimitResetAt.value = null
    applyReposPageCache(cached)
    return true
  }

  async function fetchReposPage(trimmedOrg: string, cacheKey: string): Promise<void> {
    try {
      const result = await listOrgRepos(trimmedOrg, {
        page: page.value,
        sort: sort.value,
        direction: direction.value,
      })

      const entry: ReposPageCache = {
        repos: result.repos,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      }

      const nextCache = new Map(reposCache.value)
      nextCache.set(cacheKey, entry)
      reposCache.value = nextCache

      applyReposPageCache(entry)
    } catch (err) {
      const parsed = parseReposError(err)
      error.value = parsed.message
      rateLimitResetAt.value = parsed.rateLimitResetAt
      clearReposView()
    }
  }

  async function loadRepos(): Promise<void> {
    const trimmedOrg = org.value.trim()
    if (!validateOrgInput(trimmedOrg)) {
      return
    }

    const cacheKey = getReposCacheKey(trimmedOrg)
    if (applyReposFromCache(cacheKey)) {
      return
    }

    loading.value = true
    error.value = null
    rateLimitResetAt.value = null

    try {
      await fetchReposPage(trimmedOrg, cacheKey)
    } finally {
      loading.value = false
    }
  }

  /**
   * Sets the loading state for a contributor.
   * @param fullName
   * @param isLoading
   */
  function setContributorLoading(fullName: string, isLoading: boolean): void {
    const next = new Set(contributorsLoading.value)
    if (isLoading) {
      next.add(fullName)
    } else {
      next.delete(fullName)
    }
    contributorsLoading.value = next
  }

  async function fetchContributors(fullName: string, owner: string, repo: string): Promise<void> {
    try {
      const contributors = await listContributors(owner, repo)

      const nextCache = new Map(contributorsCache.value)
      nextCache.set(fullName, contributors)
      contributorsCache.value = nextCache
    } catch {
      const nextCache = new Map(contributorsCache.value)
      nextCache.set(fullName, [])
      contributorsCache.value = nextCache
    }
  }

  async function loadContributors(fullName: string): Promise<void> {
    if (contributorsCache.value.has(fullName)) {
      return
    }

    const parts = splitFullName(fullName)
    if (!parts) {
      return
    }

    setContributorLoading(fullName, true)

    try {
      await fetchContributors(fullName, parts.owner, parts.repo)
    } finally {
      setContributorLoading(fullName, false)
    }
  }

  async function search(): Promise<void> {
    page.value = 1
    expandedRepoId.value = null
    await loadRepos()
  }

  async function goToPage(nextPage: number): Promise<void> {
    if (nextPage < 1) {
      return
    }

    page.value = nextPage
    expandedRepoId.value = null
    await loadRepos()
  }

  async function changeSort(option: SortOption): Promise<void> {
    sort.value = option.sort
    direction.value = option.direction
    page.value = 1
    expandedRepoId.value = null
    await loadRepos()
  }

  async function toggleExpand(repo: GitHubRepo): Promise<void> {
    if (expandedRepoId.value === repo.id) {
      expandedRepoId.value = null
      return
    }

    expandedRepoId.value = repo.id
    await loadContributors(repo.full_name)
  }

  function getContributors(fullName: string): Contributor[] | undefined {
    return contributorsCache.value.get(fullName)
  }

  function isContributorsLoading(fullName: string): boolean {
    return contributorsLoading.value.has(fullName)
  }

  return {
    org,
    page,
    sort,
    direction,
    repos,
    loading,
    error,
    hasNextPage,
    hasPrevPage,
    rateLimitResetAt,
    rateLimitMessage,
    expandedRepoId,
    reposCache,
    contributorsCache,
    selectedSortOption,
    sortSelectValue,
    search,
    goToPage,
    changeSort,
    toggleExpand,
    getContributors,
    isContributorsLoading,
    loadRepos,
  }
})
