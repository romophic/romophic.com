import { describe, it, expect } from 'vitest'
import { headingIdsChanged } from './toc-core'

describe('headingIdsChanged', () => {
  it('returns false for identical arrays', () => {
    expect(headingIdsChanged(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(false)
  })

  it('returns true for different lengths', () => {
    expect(headingIdsChanged(['a', 'b'], ['a', 'b', 'c'])).toBe(true)
  })

  it('returns true for same length but different content', () => {
    expect(headingIdsChanged(['a', 'b', 'c'], ['a', 'x', 'c'])).toBe(true)
  })

  it('returns false for two empty arrays', () => {
    expect(headingIdsChanged([], [])).toBe(false)
  })

  it('returns true when comparing empty to non-empty', () => {
    expect(headingIdsChanged([], ['a'])).toBe(true)
    expect(headingIdsChanged(['a'], [])).toBe(true)
  })

  it('returns true when order differs', () => {
    expect(headingIdsChanged(['a', 'b'], ['b', 'a'])).toBe(true)
  })
})
