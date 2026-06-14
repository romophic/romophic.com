/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import BlogPost from './BlogPost.astro'
import * as dataUtils from '@/lib/data-utils'
vi.mock('@/lib/data-utils')
vi.mock('astro:content', async (importOriginal) => {
  const mock = await import('./__mocks__/Mock.astro')
  return {
    ...(await importOriginal<typeof import('astro:content')>()),
    render: vi.fn().mockResolvedValue({ Content: mock.default, headings: [] }),
  }
})
vi.mock('@/components/GiscusComments.astro', async () => await import('./__mocks__/Mock.astro'))

describe('BlogPost.astro', () => {
  it('renders a blog post without crashing', async () => {
    vi.mocked(dataUtils.getParentId).mockReturnValue(undefined as any)
    vi.mocked(dataUtils.getPostPageData).mockResolvedValue({
      authors: [],
      isCurrentSubpost: false,
      navigation: { newer: undefined, older: undefined, parent: undefined },
      hasChildPosts: false,
      subpostCount: 0,
      postReadingTime: '5 min',
      combinedReadingTime: '5 min',
      tocSections: [],
      backlinks: [],
    } as any)

    const mockPost = {
      id: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Post',
        description: 'Test Desc',
        date: new Date(),
      },
    } as any

    const container = await AstroContainer.create()
    const html = await container.renderToString(BlogPost, {
      props: { post: mockPost },
    })

    expect(html).toBeTruthy()
  })
})
