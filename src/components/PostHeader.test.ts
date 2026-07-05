import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import type { CollectionEntry } from 'astro:content'
import PostHeader from './PostHeader.astro'

describe('PostHeader.astro (Test as Documentation)', () => {
  it('renders post title, authors, reading time, and subpost count', async () => {
    const container = await AstroContainer.create()
    const mockPost = {
      id: 'post-1',
      data: {
        title: 'Complete Guide to Astro',
        date: new Date('2024-05-10'),
        tags: ['Astro', 'Web'],
      },
    } as unknown as CollectionEntry<'blog'>

    const mockAuthors = [
      {
        id: 'author-1',
        name: 'Jane Doe',
        avatar: 'https://example.com/avatar.png',
        isRegistered: true,
      },
    ]

    const html = await container.renderToString(PostHeader, {
      props: {
        post: mockPost,
        authors: mockAuthors,
        postReadingTime: 5,
        combinedReadingTime: 15,
        subpostCount: 3,
      },
    })

    expect(html).toContain('Complete Guide to Astro')
    expect(html).toContain('Jane Doe')
    expect(html).toContain('5 min read')
    expect(html).toContain('(15 min read total)')
    expect(html).toContain('3 subposts')
    expect(html).toContain('Astro')
  })
})
