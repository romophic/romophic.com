import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import BlogCard from './BlogCard.astro'
import { makeBlogPost } from '@/test-utils/make-post'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/data-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data-utils')>()
  return {
    ...actual,
    getSubpostCount: vi.fn(),
    getCombinedReadingTime: vi.fn().mockResolvedValue(5),
    parseAuthors: vi.fn().mockResolvedValue([]),
    isSubpost: vi.fn(),
  }
})

describe('BlogCard.astro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dataUtils.getSubpostCount).mockResolvedValue(0)
    vi.mocked(dataUtils.isSubpost).mockReturnValue(false)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders a blog card given an entry', async () => {
    const mockEntry = makeBlogPost({
      id: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Post Title',
        description: 'This is a test description',
        date: new Date('2026-05-27'),
        tags: ['test', 'vitest'],
      },
    })

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogCard, {
      props: { entry: mockEntry },
    })

    expect(html).toContain('Test Post Title')
    expect(html).toContain('This is a test description')
    expect(html).toContain('test')
    expect(html).toContain('vitest')
    expect(html).toContain('href="/blog/test-post"')
    expect(html).toMatch(/<h3[^>]*>Test Post Title<\/h3>/)
  })

  it('uses an h2 heading when requested by a listing page', async () => {
    const mockEntry = makeBlogPost({
      id: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Post Title',
        description: 'This is a test description',
        date: new Date('2026-05-27'),
      },
    })

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogCard, {
      props: { entry: mockEntry, headingLevel: 2 },
    })

    expect(html).toMatch(/<h2[^>]*>Test Post Title<\/h2>/)
    expect(html).not.toMatch(/<h3[^>]*>Test Post Title<\/h3>/)
  })

  it('renders correctly with 1 subpost', async () => {
    vi.mocked(dataUtils.getSubpostCount).mockResolvedValue(1)

    const mockEntry = makeBlogPost({
      id: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Post Title',
        description: 'This is a test description',
        date: new Date('2026-05-27'),
      },
    })

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogCard, {
      props: { entry: mockEntry },
    })

    expect(html).toContain('1 subpost')
    expect(html).not.toContain('1 subposts')
  })

  it('renders correctly with multiple subposts', async () => {
    vi.mocked(dataUtils.getSubpostCount).mockResolvedValue(3)

    const mockEntry = makeBlogPost({
      id: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Post Title',
        description: 'This is a test description',
        date: new Date('2026-05-27'),
      },
    })

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogCard, {
      props: { entry: mockEntry },
    })

    expect(html).toContain('3 subposts')
  })

  it('renders subpost correctly without showing subpost count', async () => {
    vi.mocked(dataUtils.isSubpost).mockReturnValue(true)
    vi.mocked(dataUtils.getSubpostCount).mockResolvedValue(5) // Should not be called or used

    const mockEntry = makeBlogPost({
      id: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Post Title',
        description: 'This is a test description',
        date: new Date('2026-05-27'),
        parent: { id: 'parent' },
      },
    })

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogCard, {
      props: { entry: mockEntry },
    })

    expect(html).not.toContain('subpost')
    expect(html).not.toContain('subposts')
  })
})
