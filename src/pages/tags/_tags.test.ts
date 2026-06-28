import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import TagsIndexPage from './index.astro'
import { getStaticPaths as getTagPaginationPaths } from './[tag]/[...page].astro'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/data-utils')

describe('tags routing and index (Test as Documentation)', () => {
  it('renders tags index page with tag badges and counts', async () => {
    vi.mocked(dataUtils.getSortedTags).mockResolvedValue([
      { tag: 'Astro', count: 5 },
      { tag: 'TypeScript', count: 3 },
    ])

    const container = await AstroContainer.create()
    const html = await container.renderToString(TagsIndexPage)

    expect(html).toContain('Astro')
    expect(html).toContain('5')
    expect(html).toContain('TypeScript')
    expect(html).toContain('3')
    expect(html).toContain('href="/tags/Astro/"')
  })

  it('generates paginated static paths for each sorted tag', async () => {
    vi.mocked(dataUtils.getSortedTags).mockResolvedValue([
      { tag: 'Web', count: 2 },
    ])
    const mockPosts = [
      { id: 'post-1', data: { title: 'Post 1', tags: ['Web'] } },
    ]
    vi.mocked(dataUtils.getPostsByTag).mockResolvedValue(
      mockPosts as unknown as Awaited<
        ReturnType<typeof dataUtils.getPostsByTag>
      >,
    )

    const paginate = vi
      .fn()
      .mockImplementation((items, { params, pageSize }) => {
        return [
          {
            params: { tag: params.tag, page: undefined },
            props: { page: { data: items.slice(0, pageSize) } },
          },
        ]
      })

    const paths = await getTagPaginationPaths({ paginate })
    expect(dataUtils.getSortedTags).toHaveBeenCalled()
    expect(dataUtils.getPostsByTag).toHaveBeenCalledWith('Web')
    expect(paths).toEqual([
      {
        params: { tag: 'Web', page: undefined },
        props: { page: { data: mockPosts } },
      },
    ])
  })
})
