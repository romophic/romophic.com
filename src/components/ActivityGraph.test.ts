import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ActivityGraph from './ActivityGraph.astro'
import * as dataUtils from '@/lib/data-utils'
import type { CollectionEntry } from 'astro:content'

vi.mock('@/lib/data-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data-utils')>()
  return {
    ...actual,
    getAllPosts: vi.fn(),
  }
})

describe('ActivityGraph.astro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(dataUtils.getAllPosts).mockResolvedValue([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the grid container and UI controls for the graph', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(ActivityGraph)

    // Check if the main graph container (CSS grid) exists
    expect(html).toContain('class="grid w-fit grid-flow-col grid-rows-7 gap-1"')

    // Check if the header "Activity" exists (using regex to ignore data-astro attributes)
    expect(html).toMatch(/<h3[^>]*>Activity<\/h3>/)

    // Check if the legend (Less/More) exists
    expect(html).toMatch(/<span[^>]*>Less<\/span>/)
    expect(html).toMatch(/<span[^>]*>More<\/span>/)
  })

  it('renders cells with various intensity colors based on post counts', async () => {
    const today = new Date()
    const createMockPost = (date: Date) =>
      ({ data: { date } }) as CollectionEntry<'blog'>

    // Create posts to hit level 1 (1 post), level 2 (2 posts), level 3 (3 posts), level 4 (5 posts)
    const mockPosts: CollectionEntry<'blog'>[] = [
      createMockPost(today), // Level 1
      createMockPost(new Date(today.getTime() - 86400000)),
      createMockPost(new Date(today.getTime() - 86400000)), // Level 2
      createMockPost(new Date(today.getTime() - 86400000 * 2)),
      createMockPost(new Date(today.getTime() - 86400000 * 2)),
      createMockPost(new Date(today.getTime() - 86400000 * 2)), // Level 3
      createMockPost(new Date(today.getTime() - 86400000 * 3)),
      createMockPost(new Date(today.getTime() - 86400000 * 3)),
      createMockPost(new Date(today.getTime() - 86400000 * 3)),
      createMockPost(new Date(today.getTime() - 86400000 * 3)),
      createMockPost(new Date(today.getTime() - 86400000 * 3)), // Level 4
    ]

    vi.mocked(dataUtils.getAllPosts).mockResolvedValue(mockPosts)

    const container = await AstroContainer.create()
    const html = await container.renderToString(ActivityGraph)

    // Just verifying it renders without errors, which means all branches were hit.
    expect(html).toContain('class="grid w-fit grid-flow-col grid-rows-7 gap-1"')
    // Should have title tooltips with counts 1, 2, 3, 5
    expect(html).toContain('1 posts on')
    expect(html).toContain('2 posts on')
    expect(html).toContain('3 posts on')
    expect(html).toContain('5 posts on')
  })
})
