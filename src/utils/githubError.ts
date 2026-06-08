import { isAxiosError } from 'axios'

import { formatRateLimitMessage } from '@/utils/rateLimit'

export interface ParsedReposError {
  message: string
  rateLimitResetAt: number | null
}

export function parseReposError(err: unknown): ParsedReposError {
  if (!isAxiosError(err)) {
    return {
      message: 'Une erreur réseau est survenue. Réessayez plus tard.',
      rateLimitResetAt: null,
    }
  }

  const status = err.response?.status

  if (status === 404) {
    return { message: 'Organisation introuvable.', rateLimitResetAt: null }
  }

  // https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
  if (status === 403) {
    const remaining = err.response?.headers['x-ratelimit-remaining']
    const resetHeader = err.response?.headers['x-ratelimit-reset']

    const resetAt =
      remaining === '0' && typeof resetHeader === 'string' ? Number.parseInt(resetHeader, 10) : null

    if (resetAt !== null && !Number.isNaN(resetAt)) {
      return {
        message: formatRateLimitMessage(resetAt),
        rateLimitResetAt: resetAt,
      }
    }

    return { message: "Accès refusé à l'API GitHub.", rateLimitResetAt: null }
  }

  return {
    message: 'Une erreur est survenue lors du chargement des dépôts.',
    rateLimitResetAt: null,
  }
}
