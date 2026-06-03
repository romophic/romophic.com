const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatDate(date: Date): string {
  return dateFormatter.format(date).replace(/\//g, '/')
}
