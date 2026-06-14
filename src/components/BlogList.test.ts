/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import BlogList from './BlogList.astro'
vi.mock('@/components/PageHead.astro', async () => await import('./__mocks__/Mock.astro'))
vi.mock('@/components/BlogCard.astro', async () => await import('./__mocks__/Mock.astro'))
vi.mock('@/layouts/Layout.astro', async () => await import('./__mocks__/Mock.astro'))

describe('BlogList.astro', () => {
  it('renders a list of blog posts grouped by year', async () => {
    const mockPage = {
      data: [
        {
          id: 'post-1',
          collection: 'blog',
          data: { title: 'Post 1', date: new Date('2026-05-27'), tags: ['test'] },
        },
        {
          id: 'post-2',
          collection: 'blog',
          data: { title: 'Post 2', date: new Date('2025-01-01') },
        },
      ],
      currentPage: 1,
      lastPage: 2,
      url: { next: '/blog/2', prev: undefined },
    } as any

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogList, {
      props: { page: mockPage },
    })

    expect(html).toContain('2026')
    expect(html).toContain('2025')
    expect(html).toContain('Page 1 of 2')
    expect(html).toContain('Next →')
  })
})
