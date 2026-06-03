import { describe, it, expect } from 'vitest'
import { formatDate } from './utils'

describe('utils', () => {
  describe('formatDate', () => {
    it('formats a date in en-US locale (now YYYY/MM/DD)', () => {
      const date = new Date('2025-03-15T00:00:00')
      const formatted = formatDate(date)
      expect(formatted).toBe('2025/03/15')
    })

    it('formats another date correctly', () => {
      const date = new Date('2024-12-01T00:00:00')
      const formatted = formatDate(date)
      expect(formatted).toBe('2024/12/01')
    })
  })


})
