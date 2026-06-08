import type { SortOption } from '@/types/github'

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Date de modification', sort: 'updated', direction: 'desc' },
  { label: 'Date de création', sort: 'created', direction: 'desc' },
  { label: 'Dernière push', sort: 'pushed', direction: 'desc' },
  { label: 'Nom (A-Z)', sort: 'full_name', direction: 'asc' },
]
