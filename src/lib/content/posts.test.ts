import { describe, it, expect, vi } from 'vitest'
import {
  isSubpost,
  getParentId,
  getNormalizedPosts,
  getAllPosts,
  getAllPostsAndSubposts,
  getAllProjects,
  getSubpostsForParent,
  getAdjacentPosts,
  getPostReadingTime,
  getCombinedReadingTime,
  hasSubposts,
  getParentPost,
  getSubpostCount,
  groupPostsByYear,
  calculateReadingTimeFast,
} from './posts'
import type { CollectionEntry } from 'astro:content'

// Mock astro:content to simulate a file system with a mix of standalone posts and a series.
vi.mock('astro:content', () => {
  return {
    getCollection: vi.fn(async (collection) => {
      if (collection === 'projects') {
        return [
          { id: 'proj-1', data: { startDate: new Date('2024-01-01') } },
          { id: 'proj-2', data: { startDate: new Date('2025-01-01') } },
          { id: 'proj-3', data: {} }, // missing startDate
        ]
      }
      if (collection === 'blog') {
        return [
          {
            id: 'standalone',
            data: {
              title: 'Standalone',
              draft: false,
              date: new Date('2025-01-01'),
              tags: ['Tech', 'Astro'],
            },
            body: 'A'.repeat(2000), // 5 min read
          },
          {
            id: 'draft-post',
            data: {
              title: 'Draft',
              draft: true,
              date: new Date('2025-01-02'),
              tags: ['Draft'],
            },
            body: '',
          },
          {
            id: 'series/index',
            data: {
              title: 'Series Root',
              draft: false,
              date: new Date('2024-01-01'),
              tags: ['Astro'],
            },
            body: 'A'.repeat(2000), // 5 min read
          },
          {
            id: 'series/part-1',
            data: {
              title: 'Part 1',
              draft: false,
              date: new Date('2024-01-02'),
              order: 1,
            },
            body: 'A'.repeat(2000), // 5 min read
          },
          {
            id: 'series/part-2',
            data: {
              title: 'Part 2',
              draft: false,
              date: new Date('2024-01-03'),
              order: 2,
            },
            body: 'A'.repeat(2000), // 5 min read
          },
          {
            id: 'series/part-2-bis',
            data: {
              title: 'Part 2 Bis',
              draft: false,
              date: new Date('2024-01-04'),
              order: 2,
            },
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
          {
            id: 'series/draft-subpost',
            data: {
              title: 'Draft Subpost',
              draft: true,
              date: new Date('2024-01-05'),
            },
            body: '',
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
        expect(
          isSubpost({
            id: 'series/part-1',
            data: {},
          } as CollectionEntry<'blog'>),
        ).toBe(true)
      })
      it('should identify a post as a standalone root post if its ID does not contain a slash', () => {
        expect(
          isSubpost({ id: 'standalone', data: {} } as CollectionEntry<'blog'>),
        ).toBe(false)
      })
      it('should identify a post as a subpost if it explicitly declares a parent in frontmatter (legacy support)', () => {
        expect(
          isSubpost({
            id: 'legacy-root',
            data: { parent: { id: 'parent-id' } },
          } as unknown as CollectionEntry<'blog'>),
        ).toBe(true)
      })
    })

    describe('getParentId', () => {
      it('should extract the parent ID from a subdirectory-based post ID', () => {
        expect(
          getParentId({
            id: 'series/part-1',
            data: {},
          } as CollectionEntry<'blog'>),
        ).toBe('series')
      })
      it('should return the explicit parent ID if defined in the frontmatter', () => {
        expect(
          getParentId({
            id: 'legacy-root',
            data: { parent: { id: 'explicit-parent' } },
          } as unknown as CollectionEntry<'blog'>),
        ).toBe('explicit-parent')
      })
      it('should return an empty string for standalone root posts', () => {
        expect(
          getParentId({
            id: 'standalone',
            data: {},
          } as CollectionEntry<'blog'>),
        ).toBe('')
      })
    })

    describe('hasSubposts & getSubpostCount', () => {
      it('should return true and the correct count if a post acts as a parent for subposts', async () => {
        expect(await hasSubposts('series')).toBe(true)
        expect(await getSubpostCount('series')).toBe(4) // part-1, part-2, part-2-bis, legacy-subpost
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

    describe('getAllPostsAndSubposts', () => {
      it('should return all posts including subposts but filter out drafts', async () => {
        const posts = await getAllPostsAndSubposts()
        expect(posts.length).toBe(6) // standalone, series, part-1, part-2, part-2-bis, legacy
      })
    })

    describe('getAllProjects', () => {
      it('should return projects sorted by startDate descending', async () => {
        const projects = await getAllProjects()
        expect(projects).toHaveLength(3)
        expect(projects[0].id).toBe('proj-2') // 2025
        expect(projects[1].id).toBe('proj-1') // 2024
        expect(projects[2].id).toBe('proj-3') // undefined date => 0
      })
    })

    describe('getSubpostsForParent', () => {
      it('should return all subposts belonging to a specific parent ID', async () => {
        const subposts = await getSubpostsForParent('series')
        expect(subposts.length).toBe(4)
      })
      it('should sort subposts primarily by their explicit order field, then by date', async () => {
        const subposts = await getSubpostsForParent('series')
        expect(subposts[0].id).toBe('series/part-1') // order: 1
        expect(subposts[1].id).toBe('series/part-2') // order: 2, 2024-01-03
        expect(subposts[2].id).toBe('series/part-2-bis') // order: 2, 2024-01-04
        expect(subposts[3].id).toBe('legacy-subpost') // order: 3
      })
      it('should exclude the parent post itself from the subpost list', async () => {
        const subposts = await getSubpostsForParent('series')
        expect(subposts.some((p) => p.id === 'series')).toBe(false)
      })
    })
  })

  describe('Navigation & Adjacency', () => {
    describe('getAdjacentPosts', () => {
      it('should return nulls if the current post is not found', async () => {
        const adjacent = await getAdjacentPosts('non-existent')
        expect(adjacent.newer).toBeNull()
        expect(adjacent.older).toBeNull()
        expect(adjacent.parent).toBeNull()
      })

      it('should return the next and previous post from the global pool for a standalone post', async () => {
        // Global chronological order: standalone (2025-01-01), series (2024-01-01)
        const adjacent = await getAdjacentPosts('standalone')
        expect(adjacent.parent).toBeNull()
        expect(adjacent.newer).toBeNull() // Standalone is the newest post
        expect(adjacent.older?.id).toBe('series')
      })

      it('should return the adjacent parts specifically from within the same series for a subpost', async () => {
        // Series order: part-1, part-2, part-2-bis, legacy
        const adjacentPart1 = await getAdjacentPosts('series/part-1')
        expect(adjacentPart1.parent?.id).toBe('series')
        expect(adjacentPart1.newer?.id).toBe('series/part-2') // Next part in order
        expect(adjacentPart1.older).toBeNull() // First part in the series

        const adjacentPart2 = await getAdjacentPosts('series/part-2')
        expect(adjacentPart2.newer?.id).toBe('series/part-2-bis')
        expect(adjacentPart2.older?.id).toBe('series/part-1')
      })

      it('should return parent and nulls if the subpost is not found in subposts list', async () => {
        // Edge case where a subpost is somehow not in the parent's subposts array
        // (e.g. it is a draft, but we directly called getAdjacentPosts with its ID)
        const adjacent = await getAdjacentPosts('series/draft-subpost')
        expect(adjacent.newer).toBeNull()
        expect(adjacent.older).toBeNull()
        expect(adjacent.parent?.id).toBe('series')
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
      it('should return 0 min read if post is not found', async () => {
        const time = await getPostReadingTime('non-existent')
        expect(time).toBe('0 min read')
      })
    })

    describe('getCombinedReadingTime', () => {
      it('should return only the individual reading time for a subpost', async () => {
        const time = await getCombinedReadingTime('series/part-1')
        expect(time).toBe('5 min read')
      })
      it('should aggregate the reading time of the parent and all its subposts for a series root', async () => {
        const time = await getCombinedReadingTime('series')
        // Parent (5) + part-1 (5) + part-2 (5) + part-2-bis (5) + legacy (5) = 25
        expect(time).toBe('25 min read')
      })
      it('should return 0 min read if post is not found', async () => {
        const time = await getCombinedReadingTime('non-existent')
        expect(time).toBe('0 min read')
      })
    })
  })

  describe('Utility Functions & Tags', () => {
    describe('Tags Operations', () => {
      it('getAllTags returns a map of tag counts', async () => {
        const { getAllTags } = await import('./posts')
        const tags = await getAllTags()
        expect(tags.get('Astro')).toBe(2) // standalone, series
        expect(tags.get('Tech')).toBe(1)
      })
      it('getPostsByTag returns posts with the specific tag', async () => {
        const { getPostsByTag } = await import('./posts')
        const posts = await getPostsByTag('Tech')
        expect(posts.length).toBe(1)
        expect(posts[0].id).toBe('standalone')
      })
      it('getSortedTags returns an array of tags sorted by count', async () => {
        const { getSortedTags } = await import('./posts')
        const sorted = await getSortedTags()
        expect(sorted[0].tag).toBe('Astro')
        expect(sorted[0].count).toBe(2)
        expect(sorted[1].tag).toBe('Tech')
      })
    })

    describe('getRecentPosts', () => {
      it('should return the specified number of recent posts', async () => {
        const { getRecentPosts } = await import('./posts')
        const recent = await getRecentPosts(1)
        expect(recent).toHaveLength(1)
        expect(recent[0].id).toBe('standalone') // Newest post
      })
    })

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
