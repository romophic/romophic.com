import { describe, it, expect, vi } from 'vitest'
import { getPostPageData } from './data-utils'
import type { CollectionEntry } from 'astro:content'

// Mock dependencies
vi.mock('./content/posts', () => ({
  isSubpost: vi.fn((post) => post.id.includes('/')),
  getAdjacentPosts: vi
    .fn()
    .mockResolvedValue({ newer: null, older: null, parent: null }),
  getParentPost: vi.fn().mockResolvedValue({ id: 'parent-mock' }),
  hasSubposts: vi.fn(async (id) => id === 'parent'),
  getSubpostCount: vi.fn(async (id) => (id === 'parent' ? 3 : 0)),
  getPostReadingTime: vi.fn().mockResolvedValue('5 min read'),
  getCombinedReadingTime: vi.fn().mockResolvedValue('15 min read'),
}))

vi.mock('./content/authors', () => ({
  parseAuthors: vi
    .fn()
    .mockResolvedValue([{ id: 'author1', name: 'Author One' }]),
}))

vi.mock('./content/toc', () => ({
  getTOCSections: vi
    .fn()
    .mockResolvedValue([{ id: 'section-1', title: 'Section 1', depth: 2 }]),
}))

vi.mock('./content/links', () => ({
  getBacklinks: vi
    .fn()
    .mockResolvedValue([{ id: 'referrer', title: 'Referrer Post' }]),
}))

describe('data-utils Specification', () => {
  describe('getPostPageData', () => {
    it('should aggregate data correctly for a standalone post', async () => {
      const mockPost = {
        id: 'standalone',
        data: { authors: ['author1'] },
      } as unknown as CollectionEntry<'blog'>

      const data = await getPostPageData(mockPost)

      expect(data.isCurrentSubpost).toBe(false)
      expect(data.hasChildPosts).toBe(false)
      expect(data.subpostCount).toBe(0)
      expect(data.parentPost).toBeNull()
      expect(data.combinedReadingTime).toBeNull() // Standalone has no combined reading time

      // Standard properties
      expect(data.authors).toHaveLength(1)
      expect(data.postReadingTime).toBe('5 min read')
      expect(data.tocSections).toHaveLength(1)
      expect(data.backlinks).toHaveLength(1)
    })

    it('should aggregate data correctly for a series parent post', async () => {
      const mockPost = {
        id: 'parent',
        data: {},
      } as unknown as CollectionEntry<'blog'>

      const data = await getPostPageData(mockPost)

      expect(data.isCurrentSubpost).toBe(false)
      expect(data.hasChildPosts).toBe(true)
      expect(data.subpostCount).toBe(3)
      expect(data.parentPost).toBeNull() // Parent doesn't have a parent
      expect(data.combinedReadingTime).toBe('15 min read') // Combined reading time is calculated
    })

    it('should aggregate data correctly for a subpost', async () => {
      const mockPost = {
        id: 'parent/child',
        data: {},
      } as unknown as CollectionEntry<'blog'>

      const data = await getPostPageData(mockPost)

      expect(data.isCurrentSubpost).toBe(true)
      expect(data.hasChildPosts).toBe(false)
      expect(data.subpostCount).toBe(0) // Subpost shouldn't fetch subpost count of itself
      expect(data.parentPost?.id).toBe('parent-mock') // Should fetch the parent post
      expect(data.combinedReadingTime).toBeNull() // Subpost doesn't calculate combined reading time for itself
    })

    it('should handle missing authors gracefully', async () => {
      const mockPost = {
        id: 'no-author',
        data: {},
      } as unknown as CollectionEntry<'blog'>
      const data = await getPostPageData(mockPost)
      expect(data.authors).toBeDefined()
    })
  })
})
