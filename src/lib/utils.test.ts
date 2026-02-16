import { describe, it, expect } from 'vitest'
import { formatDate, getHeadingMargin } from './utils'

describe('utils', () => {
    describe('formatDate', () => {
        it('formats a date in en-US locale', () => {
            const date = new Date('2025-03-15T00:00:00')
            const formatted = formatDate(date)
            expect(formatted).toContain('March')
            expect(formatted).toContain('15')
            expect(formatted).toContain('2025')
        })

        it('formats another date correctly', () => {
            const date = new Date('2024-12-01T00:00:00')
            const formatted = formatDate(date)
            expect(formatted).toContain('December')
            expect(formatted).toContain('1')
            expect(formatted).toContain('2024')
        })
    })

    describe('getHeadingMargin', () => {
        it('returns correct margin for depth 3', () => {
            expect(getHeadingMargin(3)).toBe('ml-4')
        })

        it('returns correct margin for depth 4', () => {
            expect(getHeadingMargin(4)).toBe('ml-8')
        })

        it('returns correct margin for depth 5', () => {
            expect(getHeadingMargin(5)).toBe('ml-12')
        })

        it('returns correct margin for depth 6', () => {
            expect(getHeadingMargin(6)).toBe('ml-16')
        })

        it('returns empty string for depth 2 (top-level in TOC)', () => {
            expect(getHeadingMargin(2)).toBe('')
        })

        it('returns empty string for unmapped depths', () => {
            expect(getHeadingMargin(1)).toBe('')
            expect(getHeadingMargin(7)).toBe('')
        })
    })
})
