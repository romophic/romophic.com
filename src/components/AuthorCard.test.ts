import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import AuthorCard from './AuthorCard.astro'

describe('AuthorCard.astro', () => {
  it('renders author details', async () => {
    const mockAuthor = {
      id: 'test-author',
      collection: 'authors',
      data: {
        name: 'Test Author',
        avatar: '/test-avatar.png',
        bio: 'Test bio description',
      }
    } as any

    const container = await AstroContainer.create()
    const html = await container.renderToString(AuthorCard, {
      props: { author: mockAuthor }
    })

    expect(html).toContain('Test Author')
    expect(html).toContain('test-avatar.png')
    expect(html).toContain('Test bio description')
  })
})
