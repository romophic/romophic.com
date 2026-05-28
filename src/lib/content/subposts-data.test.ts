import { describe, it, expect, vi } from 'vitest'
import { getSubpostsData } from './subposts-data'
import type { CollectionEntry } from 'astro:content'

// Mock the posts utilities that getSubpostsData relies on
vi.mock('./posts', () => {
  return {
    getPostById: vi.fn(async (id: string) => {
      const posts: Record<string, any> = {
        'standalone': { id: 'standalone', data: {} },
        'series': { id: 'series', data: {} },
        'series/part-1': { id: 'series/part-1', data: {} },
      }
      return posts[id] || null
    }),
    isSubpost: vi.fn((post: any) => post.id.includes('/')),
    getParentId: vi.fn((post: any) => (post.id.includes('/') ? post.id.split('/')[0] : '')),
    getParentPost: vi.fn(async (id: string) => {
      if (id.includes('/')) return { id: id.split('/')[0], data: {} }
      return null
    }),
    getSubpostsForParent: vi.fn(async (parentId: string) => {
      if (parentId === 'series') {
        return [
          { id: 'series/part-1', data: {} }
        ]
      }
      return []
    }),
    getPostReadingTime: vi.fn(async () => '5 min read'),
    getCombinedReadingTime: vi.fn(async () => '10 min read'),
  }
})

describe('Subposts Data Aggregation Specification', () => {
  describe('getSubpostsData', () => {
    it('should aggregate data correctly when viewing a standalone root post', async () => {
      const data = await getSubpostsData('standalone', 'standalone')
      
      expect(data.isActivePost).toBe(true)
      expect(data.isCurrentSubpost).toBe(false)
      expect(data.activePost.id).toBe('standalone')
      expect(data.activePostReadingTime).toBe('5 min read')
      
      // Standalone has no subposts, so combined reading time is null
      expect(data.activePostCombinedReadingTime).toBeNull()
      expect(data.subpostsWithReadingTime).toHaveLength(0)
      expect(data.currentSubpostDetails).toBeNull()
    })

    it('should aggregate data correctly when viewing a series root post (parent)', async () => {
      const data = await getSubpostsData('series', 'series')
      
      expect(data.isActivePost).toBe(true)
      expect(data.isCurrentSubpost).toBe(false)
      expect(data.activePost.id).toBe('series')
      expect(data.activePostReadingTime).toBe('5 min read')
      
      // Parent with subposts should have combined reading time
      expect(data.activePostCombinedReadingTime).toBe('10 min read')
      
      // Should populate subposts array with reading times
      expect(data.subpostsWithReadingTime).toHaveLength(1)
      expect(data.subpostsWithReadingTime[0].id).toBe('series/part-1')
      expect(data.subpostsWithReadingTime[0].readingTime).toBe('5 min read')
      
      // Root post itself is not a subpost
      expect(data.currentSubpostDetails).toBeNull()
    })

    it('should aggregate data correctly when viewing a subpost within a series', async () => {
      // Viewing part-1, but the parent ID is 'series'
      const data = await getSubpostsData('series', 'series/part-1')
      
      expect(data.isActivePost).toBe(false) // The activePost refers to the parent in this context
      expect(data.isCurrentSubpost).toBe(true)
      expect(data.activePost.id).toBe('series') // The parent is resolved correctly
      
      // Subpost details should be extracted correctly from the list
      expect(data.currentSubpostDetails).not.toBeNull()
      expect(data.currentSubpostDetails?.id).toBe('series/part-1')
      expect(data.currentSubpostDetails?.readingTime).toBe('5 min read')
    })
    
    it('should throw an error if the requested post ID does not exist', async () => {
      await expect(getSubpostsData('standalone', 'non-existent')).rejects.toThrow('Post not found: non-existent')
    })
  })
})
