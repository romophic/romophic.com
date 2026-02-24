import { describe, it, expect } from 'vitest'
import { formatDate, getHeadingMargin } from './utils'

describe('utils', () => {
    describe('formatDate', () => {
        it('formats a date in en-US locale', () => {
            const date = new Date('2025-03-15T00:00:00')
            const formatted = formatDate(date)
            expect(formatted).toContain('Mar 15, 2025')
        })

        it('formats another date correctly', () => {
            const date = new Date('2024-12-01T00:00:00')
            const formatted = formatDate(date)
            expect(formatted).toContain('Dec 1, 2024')
        })
    })

    describe('getHeadingMargin', () => {
        it('returns correct margin for depth 2 and 3', () => {
            expect(getHeadingMargin(2)).toBe('mt-2 mb-1')
            expect(getHeadingMargin(3)).toBe('mt-2 mb-1')
        })

        it('returns correct margin for depth 4', () => {
            expect(getHeadingMargin(4)).toBe('mt-1 mb-0')
        })

        it('returns empty string for other depths', () => {
            expect(getHeadingMargin(1)).toBe('')
            expect(getHeadingMargin(5)).toBe('')
            expect(getHeadingMargin(6)).toBe('')
        })
    })
})
