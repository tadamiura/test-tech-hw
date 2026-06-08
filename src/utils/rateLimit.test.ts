import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { minutesUntilUnixTimestamp, formatRateLimitMessage } from './rateLimit'

describe('minutesUntilUnixTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-08T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns minutes until the timestamp, rounded up', () => {
    const resetAt = Math.floor(new Date('2026-06-08T12:05:30.000Z').getTime() / 1000)

    expect(minutesUntilUnixTimestamp(resetAt)).toBe(6)
  })

  it('returns at least 1 minute when reset is in the past', () => {
    const resetAt = Math.floor(new Date('2026-06-08T11:59:00.000Z').getTime() / 1000)

    expect(minutesUntilUnixTimestamp(resetAt)).toBe(1)
  })
})

describe('formatRateLimitMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-08T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats a singular minute', () => {
    const resetAt = Math.floor(new Date('2026-06-08T12:00:30.000Z').getTime() / 1000)

    expect(formatRateLimitMessage(resetAt)).toBe('Limite API atteinte, réessayez dans 1 minute.')
  })

  it('formats plural minutes', () => {
    const resetAt = Math.floor(new Date('2026-06-08T12:10:00.000Z').getTime() / 1000)

    expect(formatRateLimitMessage(resetAt)).toBe('Limite API atteinte, réessayez dans 10 minutes.')
  })
})
