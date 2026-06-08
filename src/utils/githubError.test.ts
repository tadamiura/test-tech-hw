import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { parseReposError } from './githubError'

function createAxiosError(status: number, headers: Record<string, string> = {}): AxiosError {
  return new AxiosError(
    'Request failed',
    undefined,
    undefined,
    undefined,
    {
      status,
      data: {},
      statusText: '',
      headers: new AxiosHeaders(headers),
      config: { headers: new AxiosHeaders() },
    },
  )
}

describe('parseReposError', () => {
  it('returns a generic network message for non-axios errors', () => {
    expect(parseReposError(new Error('network'))).toEqual({
      message: 'Une erreur réseau est survenue. Réessayez plus tard.',
      rateLimitResetAt: null,
    })
  })

  it('returns a not found message for 404', () => {
    expect(parseReposError(createAxiosError(404))).toEqual({
      message: 'Organisation introuvable.',
      rateLimitResetAt: null,
    })
  })

  it('returns a rate limit message for 403 with exhausted quota', () => {
    const resetAt = Math.floor(Date.now() / 1000) + 600
    const parsed = parseReposError(
      createAxiosError(403, {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': String(resetAt),
      }),
    )

    expect(parsed.rateLimitResetAt).toBe(resetAt)
    expect(parsed.message).toMatch(/Limite API atteinte/)
  })

  it('returns a forbidden message for 403 without rate limit headers', () => {
    expect(parseReposError(createAxiosError(403))).toEqual({
      message: "Accès refusé à l'API GitHub.",
      rateLimitResetAt: null,
    })
  })
})
