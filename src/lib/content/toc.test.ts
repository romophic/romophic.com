import { describe, it, expect, vi } from 'vitest'
import { getTOCSections } from './toc'
import type { CollectionEntry } from 'astro:content'

vi.mock('astro:content', () => ({
  render: vi.fn(async (post: CollectionEntry<'blog'>) => {
    if (post.id === 'parent') {
      return { headings: [{ slug: 'intro', text: 'Introduction', depth: 2 }] }
    }
    if (post.id === 'parent/child-1') {
      return {
        headings: [
          { slug: 'child-1-title', text: 'Child 1 Title', depth: 1 },
          { slug: 'child-1-sub', text: 'Child 1 Sub', depth: 2 },
        ],
      }
    }
    return { headings: [] }
  }),
}))

vi.mock('./posts', () => ({
  getPostById: vi.fn(async (id: string) => {
    if (id === 'parent') return { id: 'parent', data: { title: 'Parent Post' } }
    if (id === 'parent/child-1')
      return {
        id: 'parent/child-1',
        data: { title: 'Child 1', parent: { id: 'parent' } },
      }
    if (id === 'standalone')
      return { id: 'standalone', data: { title: 'Standalone' } }
    if (id === 'missing-parent')
      return { id: 'missing-parent', data: { parent: { id: 'non-existent' } } }
    return null
  }),
  isSubpost: vi.fn(
    (post: { id: string; data: { parent?: unknown } }) =>
      post.id.includes('/') || post.data.parent,
  ),
  getParentId: vi.fn((post: { id: string }) =>
    post.id.includes('/') ? post.id.split('/')[0] : '',
  ),
  getSubpostsForParent: vi.fn(async (parentId: string) => {
    if (parentId === 'parent') {
      return [
        { id: 'parent/child-1', data: { title: 'Child 1' } },
        { id: 'parent/child-empty', data: { title: 'Child Empty' } },
      ]
    }
    return []
  }),
}))

describe('TOC Generation Specification', () => {
  describe('getTOCSections', () => {
    it('should aggregate headings from a standalone post correctly', async () => {
      const sections = await getTOCSections('standalone')
      // Render mock returns empty headings for standalone, so sections should be empty
      expect(sections).toHaveLength(0)
    })

    it('should aggregate headings from a parent post and its subposts', async () => {
      const sections = await getTOCSections('parent')
      expect(sections).toHaveLength(2)

      // Section 0: Parent overview
      expect(sections[0].type).toBe('parent')
      expect(sections[0].title).toBe('Overview')
      expect(sections[0].headings).toHaveLength(1)
      expect(sections[0].headings[0].text).toBe('Introduction')

      // Section 1: Subpost
      expect(sections[1].type).toBe('subpost')
      expect(sections[1].title).toBe('Child 1')
      expect(sections[1].headings).toHaveLength(2)
      expect(sections[1].headings[0].isSubpostTitle).toBe(true) // The first heading is marked as the subpost title
      expect(sections[1].headings[1].isSubpostTitle).toBe(false)
    })

    it('should resolve TOC starting from the parent even when requested from a subpost', async () => {
      // By passing 'parent/child-1', it should resolve to 'parent' and yield the same result
      const sections = await getTOCSections('parent/child-1')
      expect(sections).toHaveLength(2)
      expect(sections[0].type).toBe('parent')
      expect(sections[1].subpostId).toBe('parent/child-1')
    })

    it('should skip subposts that have no headings', async () => {
      const sections = await getTOCSections('parent')
      // 'parent/child-empty' returns empty headings in the mock, so it should not be added to sections
      const emptyChildSection = sections.find(
        (s) => 'subpostId' in s && s.subpostId === 'parent/child-empty',
      )
      expect(emptyChildSection).toBeUndefined()
    })

    it('should return an empty array if the requested post does not exist', async () => {
      const sections = await getTOCSections('non-existent')
      expect(sections).toHaveLength(0)
    })

    it('should return an empty array if the parent post is missing (orphaned subpost)', async () => {
      const sections = await getTOCSections('missing-parent')
      expect(sections).toHaveLength(0)
    })
  })
})
