/**
 * Minutes remaining until a Unix timestamp (seconds), rounded up, minimum 1.
 */
export function minutesUntilUnixTimestamp(timestampSeconds: number): number {
  return Math.max(1, Math.ceil((timestampSeconds * 1000 - Date.now()) / 60_000))
}

/**
 * Formats a rate limit reset timestamp for display.
 */
export function formatRateLimitMessage(resetTimestampSeconds: number): string {
  const minutes = minutesUntilUnixTimestamp(resetTimestampSeconds)
  return `Limite API atteinte, réessayez dans ${minutes} minute${minutes > 1 ? 's' : ''}.`
}
