import { describe, expect, it } from 'vitest'

import { formatDateFr } from './date'

describe('formatDateFr', () => {
  it('formats an ISO date string using French locale', () => {
    const iso = '2026-06-06T12:30:00.000Z'
    const expected = new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(iso))

    expect(formatDateFr(iso)).toBe(expected)
  })

  it('includes month name and year for a known date', () => {
    const result = formatDateFr('2026-06-06T12:30:00.000Z')

    expect(result).toMatch(/juin/)
    expect(result).toMatch(/2026/)
  })
})
