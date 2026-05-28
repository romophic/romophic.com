/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import BlogCard from './BlogCard.astro'

describe('BlogCard.astro', () => {
  it('renders a blog card given an entry', async () => {
    const mockEntry = {
      id: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Post Title',
        description: 'This is a test description',
        date: new Date('2026-05-27'),
        tags: ['test', 'vitest'],
      }
    } as any

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogCard, {
      props: { entry: mockEntry }
    })

    expect(html).toContain('Test Post Title')
    expect(html).toContain('This is a test description')
    expect(html).toContain('test')
    expect(html).toContain('vitest')
    expect(html).toContain('href="/blog/test-post"')
  })
})
