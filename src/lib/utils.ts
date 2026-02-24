export function formatDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date)
}

export function getHeadingMargin(depth: number) {
    if (depth === 2 || depth === 3) return 'mt-2 mb-1'
    if (depth === 4) return 'mt-1 mb-0'
    return ''
}
