import { describe, it, expect } from 'vitest'
import { resolveLinkToId, normalizeId } from './links'

describe('links utils', () => {
  describe('resolveLinkToId', () => {
    it('resolves absolute blog links', () => {
      expect(resolveLinkToId('/blog/my-post', 'any-source')).toBe('my-post')
      expect(resolveLinkToId('/blog/parent/child', 'any-source')).toBe(
        'parent/child',
      )
      expect(
        resolveLinkToId('/blog/romophic-library/lib/directed-graph', 'source'),
      ).toBe('romophic-library/lib/directed-graph')
    })

    it('resolves relative links from nested post', () => {
      // Current dir: romophic-library/lib
      const sourceId = 'romophic-library/lib/directed-graph'

      expect(resolveLinkToId('./dijkstra', sourceId)).toBe(
        'romophic-library/lib/dijkstra',
      )

      expect(resolveLinkToId('../index', sourceId)).toBe(
        'romophic-library/index',
      )
    })

    it('resolves relative links from index post (assuming id includes /index)', () => {
      const sourceId = 'romophic-library/index'

      expect(resolveLinkToId('./lib/directed-graph', sourceId)).toBe(
        'romophic-library/lib/directed-graph',
      )
    })

    it('ignores external links', () => {
      expect(resolveLinkToId('https://example.com', 'source')).toBeNull()
      expect(resolveLinkToId('mailto:user@example.com', 'source')).toBeNull()
    })

    it('strips anchor fragments before resolving', () => {
      expect(resolveLinkToId('/blog/my-post#section-1', 'source')).toBe(
        'my-post',
      )
    })

    it('strips query parameters before resolving', () => {
      expect(resolveLinkToId('/blog/my-post?foo=bar', 'source')).toBe('my-post')
    })

    it('ignores protocol-relative URLs', () => {
      expect(resolveLinkToId('//example.com/blog', 'source')).toBeNull()
    })

    it('resolves bare relative paths (without ./ prefix)', () => {
      const sourceId = 'parent/child'
      expect(resolveLinkToId('sibling', sourceId)).toBe('parent/sibling')
    })

    it('returns null for non-blog absolute paths', () => {
      expect(resolveLinkToId('/about', 'source')).toBeNull()
      expect(resolveLinkToId('/graph', 'source')).toBeNull()
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
      expect(normalizeId('romophic-library/lib/directed-graph')).toBe(
        'romophic-library/lib/directed-graph',
      )
    })

    it('only strips trailing /index', () => {
      expect(normalizeId('index')).toBe('index')
      expect(normalizeId('my-index')).toBe('my-index')
    })

    it('handles deeply nested index', () => {
      expect(normalizeId('a/b/c/index')).toBe('a/b/c')
    })
  })
})
