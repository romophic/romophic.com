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

function createSubpost(id: string, parentId: string): CollectionEntry<'blog'> {
  return {
    id,
    data: {
      title: id,
      description: '',
      tags: [],
      parent: { collection: 'blog', id: parentId },
    },
    body: '',
  } as unknown as CollectionEntry<'blog'>
}

describe('posts utils', () => {
  describe('isSubpost', () => {
    it('returns true when parent is defined', () => {
      expect(isSubpost(createSubpost('child', 'parent'))).toBe(true)
    })

    it('returns false when parent is undefined', () => {
      expect(isSubpost(createMockPost('my-post', new Date()))).toBe(false)
    })
  })

  describe('getParentId', () => {
    it('returns parent id when parent is defined', () => {
      expect(getParentId(createSubpost('child', 'parent'))).toBe('parent')
    })

    it('returns empty string when parent is undefined', () => {
      expect(getParentId(createMockPost('my-post', new Date()))).toBe('')
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
