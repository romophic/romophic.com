/* eslint-disable @typescript-eslint/no-explicit-any */
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
      },
    } as any

    const container = await AstroContainer.create()
    const html = await container.renderToString(AuthorCard, {
      props: { author: mockAuthor },
    })

    expect(html).toContain('Test Author')
    expect(html).toContain('test-avatar.png')
    expect(html).toContain('Test bio description')
  })

  it('renders correctly with no avatar, with pronouns, social links, and on author page', async () => {
    const mockAuthor = {
      id: 'test-author',
      collection: 'authors',
      data: {
        name: 'John Doe',
        bio: 'Another bio',
        pronouns: 'he/him',
        website: 'https://johndoe.com',
        github: 'https://github.com/johndoe',
        twitter: 'https://twitter.com/johndoe',
        linkedin: 'https://linkedin.com/in/johndoe',
        mail: 'john@example.com',
      },
    } as any

    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/authors/test-author')
    const html = await container.renderToString(AuthorCard, {
      props: { author: mockAuthor },
      request,
    })

    // Check fallback avatar (first letter)
    expect(html).toContain('J')
    // Check pronouns
    expect(html).toContain('(he/him)')

    // Check social links
    expect(html).toContain('href="https://johndoe.com"')
    expect(html).toContain('href="https://github.com/johndoe"')
    expect(html).toContain('href="https://twitter.com/johndoe"')
    expect(html).toContain('href="https://linkedin.com/in/johndoe"')
    expect(html).toContain('href="mailto:john@example.com"')

    // Check pointer-events-none class because we are on author page
    expect(html).toContain('pointer-events-none')
  })
})
