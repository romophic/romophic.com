import { vi } from 'vitest'

// Astro's content layer does not load its data store under vitest, so every
// unmocked getCollection() call logs "The collection ... does not exist or is
// empty" and returns []. Make that contract explicit and silent here: tests
// see empty collections unless they provide their own data. Per-file
// vi.mock('astro:content', ...) overrides take precedence over this mock.
vi.mock('astro:content', () => ({
  getCollection: vi.fn(async () => []),
  getEntry: vi.fn(async () => undefined),
  getEntryBySlug: vi.fn(async () => undefined),
  render: vi.fn(async () => ({
    Content: () => null,
    headings: [],
    remarkPluginFrontmatter: {},
  })),
}))
