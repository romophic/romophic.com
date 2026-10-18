import { describe, it, expect } from 'vitest'
import { formatDate, dateKey, pluralize } from './utils'

describe('utils', () => {
  describe('formatDate', () => {
    it('formats a date as YYYY/MM/DD in JST regardless of host timezone', () => {
      // 2025-03-14T15:00:00Z === 2025-03-15 00:00 JST
      expect(formatDate(new Date('2025-03-14T15:00:00Z'))).toBe('2025/03/15')
      expect(formatDate(new Date('2024-11-30T15:00:00Z'))).toBe('2024/12/01')
    })
  })

  describe('dateKey', () => {
    it('returns the JST calendar date as YYYY-MM-DD', () => {
      expect(dateKey(new Date('2025-03-14T15:00:00Z'))).toBe('2025-03-15')
    })

    it('keeps the JST day up to 14:59:59Z and rolls over at 15:00Z', () => {
      // JST is UTC+9: the day rolls over at 15:00 UTC
      expect(dateKey(new Date('2025-03-15T14:59:59Z'))).toBe('2025-03-15')
      expect(dateKey(new Date('2025-03-15T15:00:00Z'))).toBe('2025-03-16')
    })

    it('assigns a UTC late-night date to the next JST day', () => {
      // 2024-12-31T15:00:00Z === 2025-01-01 00:00 JST
      expect(dateKey(new Date('2024-12-31T15:00:00Z'))).toBe('2025-01-01')
    })
  })

  describe('pluralize', () => {
    it('returns the singular form only for exactly one', () => {
      expect(pluralize(1, 'post')).toBe('post')
      expect(pluralize(0, 'post')).toBe('posts')
      expect(pluralize(2, 'post')).toBe('posts')
    })

    it('accepts an explicit irregular plural', () => {
      expect(pluralize(2, 'child', 'children')).toBe('children')
    })
  })
})
