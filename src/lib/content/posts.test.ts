import { describe, it, expect } from 'vitest'
import { isSubpost, getParentId, groupPostsByYear } from './posts'
import type { CollectionEntry } from 'astro:content'

// Helper to create a minimal post-like object for groupPostsByYear tests
function createMockPost(id: string, date: Date): CollectionEntry<'blog'> {
  return {
    id,
    data: { date, title: id, description: '', tags: [] },
    body: '',
  } as unknown as CollectionEntry<'blog'>
}

describe('posts utils', () => {
  describe('isSubpost', () => {
    it('returns true for nested paths', () => {
      expect(isSubpost('parent/child')).toBe(true)
      expect(isSubpost('romophic-library/lib/directed-graph')).toBe(true)
    })

    it('returns false for root paths', () => {
      expect(isSubpost('my-post')).toBe(false)
      expect(isSubpost('romophic-library')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(isSubpost('')).toBe(false)
      expect(isSubpost('a/b/c/d/e')).toBe(true)
    })
  })

  describe('getParentId', () => {
    it('extracts immediate parent id from subpost id', () => {
      expect(getParentId('parent/child')).toBe('parent')
      expect(getParentId('romophic-library/lib/directed-graph')).toBe(
        'romophic-library/lib',
      )
    })

    it('handles deep nesting', () => {
      expect(getParentId('a/b/c/d')).toBe('a/b/c')
    })

    it('returns empty string for top-level ids', () => {
      expect(getParentId('my-post')).toBe('')
    })
  })

  describe('groupPostsByYear', () => {
    it('groups posts by year correctly', () => {
      const posts = [
        createMockPost('post-a', new Date('2025-01-15')),
        createMockPost('post-b', new Date('2025-06-20')),
        createMockPost('post-c', new Date('2024-03-10')),
      ]
      const grouped = groupPostsByYear(posts)
      expect(Object.keys(grouped)).toHaveLength(2)
      expect(grouped['2025']).toHaveLength(2)
      expect(grouped['2024']).toHaveLength(1)
    })

    it('returns empty object for empty array', () => {
      const grouped = groupPostsByYear([])
      expect(Object.keys(grouped)).toHaveLength(0)
    })

    it('preserves original order within each year', () => {
      const posts = [
        createMockPost('first', new Date('2025-12-01')),
        createMockPost('second', new Date('2025-01-01')),
      ]
      const grouped = groupPostsByYear(posts)
      expect(grouped['2025'][0].id).toBe('first')
      expect(grouped['2025'][1].id).toBe('second')
    })
  })
})
