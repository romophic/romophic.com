import { describe, it, expect } from 'vitest';
import { isSubpost, getParentId } from './posts';

describe('posts utils', () => {
  describe('isSubpost', () => {
    it('returns true for nested paths', () => {
      expect(isSubpost('parent/child')).toBe(true);
      expect(isSubpost('romophic-library/lib/directed-graph')).toBe(true);
    });

    it('returns false for root paths', () => {
      expect(isSubpost('my-post')).toBe(false);
      expect(isSubpost('romophic-library')).toBe(false);
    });
  });

  describe('getParentId', () => {
    it('extracts parent id from subpost id', () => {
      expect(getParentId('parent/child')).toBe('parent');
      expect(getParentId('romophic-library/lib/directed-graph')).toBe('romophic-library');
    });
  });
});
