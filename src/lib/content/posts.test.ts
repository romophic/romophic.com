import { describe, it, expect, vi } from 'vitest'
import {
  isSubpost,
  getParentId,
  getNormalizedPosts,
  getAllPosts,
  getSubpostsForParent,
  getAdjacentPosts,
  getPostReadingTime,
  getCombinedReadingTime,
  hasSubposts,
  getParentPost,
  getSubpostCount,
  groupPostsByYear,
  calculateReadingTimeFast
} from './posts'
import type { CollectionEntry } from 'astro:content'

// Mock astro:content to simulate a file system with a mix of standalone posts and a series.
vi.mock('astro:content', () => {
  return {
    getCollection: vi.fn(async (collection) => {
      if (collection === 'blog') {
        return [
          {
            id: 'standalone',
            data: { title: 'Standalone', draft: false, date: new Date('2025-01-01') },
            body: 'A'.repeat(2000), // 5 min read
          },
          {
            id: 'draft-post',
            data: { title: 'Draft', draft: true, date: new Date('2025-01-02') },
            body: '',
          },
          {
            id: 'series/index',
            data: { title: 'Series Root', draft: false, date: new Date('2024-01-01') },
            body: 'A'.repeat(2000), // 5 min read
          },
          {
            id: 'series/part-1',
            data: { title: 'Part 1', draft: false, date: new Date('2024-01-02'), order: 1 },
            body: 'A'.repeat(2000), // 5 min read
          },
          {
            id: 'series/part-2',
            data: { title: 'Part 2', draft: false, date: new Date('2024-01-03'), order: 2 },
            body: 'A'.repeat(2000), // 5 min read
          },
          // Legacy support testing: explicit parent declared in frontmatter
          {
            id: 'legacy-subpost',
            data: {
              title: 'Legacy',
              draft: false,
              date: new Date('2024-01-04'),
              parent: { id: 'series/index', collection: 'blog' },
              order: 3,
            },
            body: 'A'.repeat(2000), // 5 min read
          },
        ]
      }
      return []
    }),
  }
})

describe('Blog Content Data Layer Specification', () => {
  describe('Hierarchy & Parent-Child Relationships', () => {
    describe('isSubpost', () => {
      it('should identify a post as a subpost if its ID contains a slash (indicating a subdirectory)', () => {
        expect(isSubpost({ id: 'series/part-1', data: {} } as CollectionEntry<'blog'>)).toBe(true)
      })
      it('should identify a post as a standalone root post if its ID does not contain a slash', () => {
        expect(isSubpost({ id: 'standalone', data: {} } as CollectionEntry<'blog'>)).toBe(false)
      })
      it('should identify a post as a subpost if it explicitly declares a parent in frontmatter (legacy support)', () => {
        expect(
          isSubpost({ id: 'legacy-root', data: { parent: { id: 'parent-id' } } } as unknown as CollectionEntry<'blog'>)
        ).toBe(true)
      })
    })

    describe('getParentId', () => {
      it('should extract the parent ID from a subdirectory-based post ID', () => {
        expect(getParentId({ id: 'series/part-1', data: {} } as CollectionEntry<'blog'>)).toBe('series')
      })
      it('should return the explicit parent ID if defined in the frontmatter', () => {
        expect(
          getParentId({
            id: 'legacy-root',
            data: { parent: { id: 'explicit-parent' } },
          } as unknown as CollectionEntry<'blog'>)
        ).toBe('explicit-parent')
      })
      it('should return an empty string for standalone root posts', () => {
        expect(getParentId({ id: 'standalone', data: {} } as CollectionEntry<'blog'>)).toBe('')
      })
    })

    describe('hasSubposts & getSubpostCount', () => {
      it('should return true and the correct count if a post acts as a parent for subposts', async () => {
        expect(await hasSubposts('series')).toBe(true)
        expect(await getSubpostCount('series')).toBe(3) // part-1, part-2, legacy-subpost
      })
      it('should return false and zero count for standalone posts', async () => {
        expect(await hasSubposts('standalone')).toBe(false)
        expect(await getSubpostCount('standalone')).toBe(0)
      })
    })

    describe('getParentPost', () => {
      it('should fetch the parent post object for a given subpost', async () => {
        const parent = await getParentPost('series/part-1')
        expect(parent?.id).toBe('series')
      })
      it('should return null if the post is a standalone root post', async () => {
        const parent = await getParentPost('standalone')
        expect(parent).toBeNull()
      })
    })
  })

  describe('Post Fetching & Normalization', () => {
    describe('getNormalizedPosts', () => {
      it('should strip the /index suffix from post IDs to create clean URLs', async () => {
        const posts = await getNormalizedPosts()
        const seriesRoot = posts.find((p) => p.data.title === 'Series Root')
        expect(seriesRoot?.id).toBe('series')
      })
    })

    describe('getAllPosts', () => {
      it('should return all normalized posts and filter out drafts', async () => {
        const posts = await getAllPosts()
        expect(posts.some((p) => p.id === 'draft-post')).toBe(false)
        expect(posts.length).toBe(2) // standalone, series
      })
      it('should sort the resulting posts by date in descending order', async () => {
        const posts = await getAllPosts()
        expect(posts[0].id).toBe('standalone') // 2025-01-01
        expect(posts[1].id).toBe('series') // 2024-01-01
      })
    })

    describe('getSubpostsForParent', () => {
      it('should return all subposts belonging to a specific parent ID', async () => {
        const subposts = await getSubpostsForParent('series')
        expect(subposts.length).toBe(3)
      })
      it('should sort subposts primarily by their explicit order field, then by date', async () => {
        const subposts = await getSubpostsForParent('series')
        expect(subposts[0].id).toBe('series/part-1') // order: 1
        expect(subposts[1].id).toBe('series/part-2') // order: 2
        expect(subposts[2].id).toBe('legacy-subpost') // order: 3
      })
      it('should exclude the parent post itself from the subpost list', async () => {
        const subposts = await getSubpostsForParent('series')
        expect(subposts.some((p) => p.id === 'series')).toBe(false)
      })
    })
  })

  describe('Navigation & Adjacency', () => {
    describe('getAdjacentPosts', () => {
      it('should return the next and previous post from the global pool for a standalone post', async () => {
        // Global chronological order: standalone (2025-01-01), series (2024-01-01)
        const adjacent = await getAdjacentPosts('standalone')
        expect(adjacent.parent).toBeNull()
        expect(adjacent.newer).toBeNull() // Standalone is the newest post
        expect(adjacent.older?.id).toBe('series')
      })

      it('should return the adjacent parts specifically from within the same series for a subpost', async () => {
        // Series order: part-1, part-2, legacy
        const adjacentPart1 = await getAdjacentPosts('series/part-1')
        expect(adjacentPart1.parent?.id).toBe('series')
        expect(adjacentPart1.newer?.id).toBe('series/part-2') // Next part in order
        expect(adjacentPart1.older).toBeNull() // First part in the series

        const adjacentPart2 = await getAdjacentPosts('series/part-2')
        expect(adjacentPart2.newer?.id).toBe('legacy-subpost')
        expect(adjacentPart2.older?.id).toBe('series/part-1')
      })
    })
  })

  describe('Reading Time Calculation', () => {
    describe('calculateReadingTimeFast', () => {
      it('should calculate reading time by counting characters ignoring whitespace', () => {
        // 400 chars = 1 min
        expect(calculateReadingTimeFast('A'.repeat(800))).toBe('2 min read')
        expect(calculateReadingTimeFast('A '.repeat(800))).toBe('2 min read') // spaces ignored
      })
      it('should return at least 1 min', () => {
        expect(calculateReadingTimeFast('A')).toBe('1 min read')
        expect(calculateReadingTimeFast('')).toBe('1 min read')
      })
    })

    describe('getPostReadingTime', () => {
      it('should calculate reading time directly from the post body', async () => {
        const time = await getPostReadingTime('standalone')
        expect(time).toBe('5 min read')
      })
    })

    describe('getCombinedReadingTime', () => {
      it('should return only the individual reading time for a subpost', async () => {
        const time = await getCombinedReadingTime('series/part-1')
        expect(time).toBe('5 min read')
      })
      it('should aggregate the reading time of the parent and all its subposts for a series root', async () => {
        const time = await getCombinedReadingTime('series')
        // Parent (5) + part-1 (5) + part-2 (5) + legacy (5) = 20
        expect(time).toBe('20 min read')
      })
    })
  })

  describe('Utility Functions', () => {
    describe('groupPostsByYear', () => {
      it('should correctly group a list of posts by the year of their date', () => {
        const posts = [
          { id: 'a', data: { date: new Date('2025-01-15') } },
          { id: 'b', data: { date: new Date('2024-03-10') } },
          { id: 'c', data: { date: new Date('2025-06-20') } },
        ] as unknown as CollectionEntry<'blog'>[]
        
        const grouped = groupPostsByYear(posts)
        expect(Object.keys(grouped)).toHaveLength(2)
        expect(grouped['2025']).toHaveLength(2)
        expect(grouped['2024']).toHaveLength(1)
      })
    })
  })
})
