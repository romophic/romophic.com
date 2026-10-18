export const TZ = 'Asia/Tokyo'

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const dateKeyFormatter = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ })

export function formatDate(date: Date): string {
  return dateFormatter.format(date)
}

/** JST calendar date as YYYY-MM-DD (sortable, build-machine independent). */
export function dateKey(date: Date): string {
  return dateKeyFormatter.format(date)
}

/** Returns the singular or plural form matching the count. */
export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return count === 1 ? singular : plural
}
