import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  resolveLinkToId,
  normalizeId,
  extractInternalLinks,
  getBacklinks,
  _resetBacklinksCache,
} from './links'
import type { CollectionEntry } from 'astro:content'

vi.mock('./posts', () => ({
  getAllPostsAndSubposts: vi.fn().mockResolvedValue([
    {
      id: 'post-1',
      data: {},
      body: 'Here is a [link](/blog/target-post) and another [rel](./relative-post) and a [dup](/blog/target-post)',
    },
    { id: 'post-2', data: {}, body: 'Link to [target](/blog/target-post)' },
    { id: 'self-linker', data: {}, body: 'Link to [self](/blog/self-linker)' },
    { id: 'target-post', data: {}, body: 'No links here' },
  ]),
}))

describe('Links Utils Specification', () => {
  beforeEach(() => {
    // Reset module state if possible, though _backlinksMap is module scoped.
    // We can just rely on the first test populating it correctly, or we can use vi.resetModules() if we wanted to be strictly isolated.
  })

  describe('resolveLinkToId', () => {
    it('resolves absolute blog links', () => {
      expect(resolveLinkToId('/blog/my-post', 'any-source')).toBe('my-post')
      expect(resolveLinkToId('/blog/parent/child', 'any-source')).toBe(
        'parent/child',
      )
    })
    it('resolves relative links from nested post', () => {
      const sourceId = 'romophic-library/lib/directed-graph'
      expect(resolveLinkToId('./dijkstra', sourceId)).toBe(
        'romophic-library/lib/dijkstra',
      )
      expect(resolveLinkToId('../index', sourceId)).toBe(
        'romophic-library/index',
      )
    })
    it('ignores external links and protocol-relative URLs', () => {
      expect(resolveLinkToId('https://example.com', 'source')).toBeNull()
      expect(resolveLinkToId('mailto:user@example.com', 'source')).toBeNull()
      expect(resolveLinkToId('//example.com/blog', 'source')).toBeNull()
    })
    it('strips anchor fragments and query parameters', () => {
      expect(resolveLinkToId('/blog/my-post#section-1', 'source')).toBe(
        'my-post',
      )
      expect(resolveLinkToId('/blog/my-post?foo=bar', 'source')).toBe('my-post')
    })
    it('returns null for non-blog absolute paths', () => {
      expect(resolveLinkToId('/about', 'source')).toBeNull()
    })
    it('strips trailing slashes from blog links', () => {
      expect(resolveLinkToId('/blog/my-post/', 'source')).toBe('my-post')
    })
  })

  describe('normalizeId', () => {
    it('strips /index suffix', () => {
      expect(normalizeId('romophic-library/index')).toBe('romophic-library')
    })
    it('leaves non-index ids unchanged', () => {
      expect(normalizeId('my-post')).toBe('my-post')
    })
  })

  describe('extractInternalLinks', () => {
    it('should extract and resolve all raw internal links from a post', async () => {
      const mockPost = {
        id: 'post-1',
        body: 'Here is a [link](/blog/target-post) and another [rel](./relative-post) and [ext](https://example.com)',
      } as CollectionEntry<'blog'>
      const targets = await extractInternalLinks(mockPost)

      expect(targets).toHaveLength(2)
      expect(targets).toContain('target-post')
      expect(targets).toContain('relative-post')
    })

    it('should return empty array if no links exist', async () => {
      const mockPost = { id: 'target-post' } as CollectionEntry<'blog'>
      const targets = await extractInternalLinks(mockPost)
      expect(targets).toHaveLength(0)
    })
  })

  describe('getBacklinks', () => {
    it('should build a map and return all posts that link to the target post', async () => {
      // Both post-1 and post-2 link to target-post
      const backlinks = await getBacklinks('target-post')
      expect(backlinks).toHaveLength(2)
      expect(backlinks.some((p) => p.id === 'post-1')).toBe(true)
      expect(backlinks.some((p) => p.id === 'post-2')).toBe(true)
    })

    it('should exclude self-links from the backlinks list', async () => {
      const backlinks = await getBacklinks('self-linker')
      // self-linker links to itself, but getBacklinks should filter it out
      expect(backlinks).toHaveLength(0)
    })

    it('should return empty array if no posts link to the target', async () => {
      const backlinks = await getBacklinks('post-1') // nobody links to post-1
      expect(backlinks).toHaveLength(0)
    })

    it('should be able to reset cache', async () => {
      _resetBacklinksCache()
      expect(typeof _resetBacklinksCache).toBe('function')
    })
  })
})
