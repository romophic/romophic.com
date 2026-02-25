export function formatDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

export function getHeadingMargin(depth: number) {
  if (depth === 2 || depth === 3) return 'mt-2 mb-1'
  if (depth === 4) return 'mt-1 mb-0'
  return ''
}
