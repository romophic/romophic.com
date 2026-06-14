/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import PostNavigation from './PostNavigation.astro'
vi.mock('astro-icon/components', async () => {
  const mock = await import('./__mocks__/Mock.astro')
  return { Icon: mock.default }
})

describe('PostNavigation.astro', () => {
  it('renders newer and older post links', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PostNavigation, {
      props: {
        newerPost: { id: 'newer', data: { title: 'Newer Post' }, collection: 'blog' },
        olderPost: { id: 'older', data: { title: 'Older Post' }, collection: 'blog' },
      } as any,
    })

    expect(html).toContain('Newer Post')
    expect(html).toContain('Older Post')
    expect(html).toContain('href="/blog/newer#post-title"')
    expect(html).toContain('href="/blog/older#post-title"')
  })

  it('renders parent post link', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(PostNavigation, {
      props: {
        parentPost: { id: 'parent', data: { title: 'Parent Post' }, collection: 'blog' },
      } as any,
    })

    expect(html).toContain('Parent Post')
    expect(html).toContain('href="/blog/parent#post-title"')
  })
})
