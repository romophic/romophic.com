import type { CollectionEntry } from 'astro:content'

/**
 * Builds a blog CollectionEntry fixture for tests.
 *
 * Fixtures only need to be structurally convincing for the code under test,
 * so this helper owns the one loosened cast instead of every test file
 * carrying `as any` around its mock posts.
 */
export function makeBlogPost(
  overrides: Record<string, unknown> = {},
): CollectionEntry<'blog'> {
  const { data: dataOverrides, ...rest } = overrides
  return {
    id: 'test-post',
    slug: 'test-post',
    body: '',
    collection: 'blog',
    data: {
      title: 'Test Post',
      description: 'A test post description',
      date: new Date('2026-01-15T00:00:00Z'),
      tags: ['test'],
      draft: false,
      ...(dataOverrides as Record<string, unknown>),
    },
    render: async () => ({
      Content: () => null,
      headings: [],
      remarkPluginFrontmatter: {},
    }),
    ...rest,
  } as unknown as CollectionEntry<'blog'>
}
