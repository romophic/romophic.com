import { describe, it, expect, vi } from 'vitest'
import { getStaticPaths as getBlogListPaths } from './[...page].astro'
import { getStaticPaths as getBlogPostPaths } from './[...id].astro'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/data-utils')

describe('blog routing (Test as Documentation)', () => {
  it('generates paginated list paths for blog posts', async () => {
    const mockPosts = Array.from({ length: 15 }).map((_, i) => ({
      id: `post-${i}`,
      data: { title: `Post ${i}` },
    }))
    vi.mocked(dataUtils.getAllPosts).mockResolvedValue(
      mockPosts as unknown as Awaited<ReturnType<typeof dataUtils.getAllPosts>>,
    )

    const paginate = vi.fn().mockImplementation((items, { pageSize }) => {
      return [
        {
          params: { page: undefined },
          props: { page: { data: items.slice(0, pageSize) } },
        },
      ]
    })

    const paths = await getBlogListPaths({ paginate })
    expect(dataUtils.getAllPosts).toHaveBeenCalled()
    expect(paginate).toHaveBeenCalledWith(mockPosts, {
      pageSize: expect.any(Number),
    })
    expect(paths).toHaveLength(1)
  })

  it('generates static paths for all posts and subposts', async () => {
    const mockAllPosts = [
      { id: 'post-a', data: { title: 'Post A' } },
      { id: 'post-a/sub-1', data: { title: 'Sub 1' } },
    ]
    vi.mocked(dataUtils.getAllPostsAndSubposts).mockResolvedValue(
      mockAllPosts as unknown as Awaited<
        ReturnType<typeof dataUtils.getAllPostsAndSubposts>
      >,
    )

    const paths = await getBlogPostPaths()
    expect(paths).toEqual([
      { params: { id: 'post-a' }, props: mockAllPosts[0] },
      { params: { id: 'post-a/sub-1' }, props: mockAllPosts[1] },
    ])
  })
})
