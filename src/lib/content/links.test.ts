import { describe, it, expect } from 'vitest';
import { resolveLinkToId } from './links';

describe('links utils', () => {
  describe('resolveLinkToId', () => {
    it('resolves absolute blog links', () => {
      expect(resolveLinkToId('/blog/my-post', 'any-source')).toBe('my-post');
      expect(resolveLinkToId('/blog/parent/child', 'any-source')).toBe('parent/child');
      expect(resolveLinkToId('/blog/romophic-library/lib/directed-graph', 'source'))
        .toBe('romophic-library/lib/directed-graph');
    });

    it('resolves relative links from nested post', () => {
      // Current dir: romophic-library/lib
      const sourceId = 'romophic-library/lib/directed-graph';
      
      expect(resolveLinkToId('./dijkstra', sourceId))
        .toBe('romophic-library/lib/dijkstra');
        
      expect(resolveLinkToId('../index', sourceId))
        .toBe('romophic-library/index');
    });

    it('resolves relative links from index post (assuming id includes /index)', () => {
      const sourceId = 'romophic-library/index';
      
      expect(resolveLinkToId('./lib/directed-graph', sourceId))
        .toBe('romophic-library/lib/directed-graph');
    });

    it('ignores external links', () => {
      expect(resolveLinkToId('https://example.com', 'source')).toBeNull();
      expect(resolveLinkToId('mailto:user@example.com', 'source')).toBeNull();
    });
  });
});
