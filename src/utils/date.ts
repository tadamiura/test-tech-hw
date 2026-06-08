const frenchDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

/**
 * Formats an ISO 8601 date string for French locale display.
 * Example: "6 juin 2026 à 14:30"
 */
export function formatDateFr(iso: string): string {
  return frenchDateFormatter.format(new Date(iso))
}
