import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import type { CollectionEntry } from 'astro:content'
import SubpostsHeader from './SubpostsHeader.astro'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/data-utils')
vi.mock('astro-icon/components', async () => {
  const mock = await import('./__mocks__/Mock.astro')
  return { Icon: mock.default }
})

describe('SubpostsHeader.astro (Test as Documentation)', () => {
  it('renders mobile-subposts navigation when subposts exist', async () => {
    const mockActivePost = {
      id: 'parent-post',
      data: { title: 'Parent Post Overview' },
    } as unknown as CollectionEntry<'blog'>

    const mockSubpost = {
      id: 'subpost-1',
      readingTime: '4 min read',
      data: { title: 'First Subpost Chapter' },
    }

    vi.mocked(dataUtils.getSubpostsData).mockResolvedValue({
      activePost: mockActivePost,
      isActivePost: true,
      activePostReadingTime: '2 min read',
      activePostCombinedReadingTime: '6 min read',
      subpostsWithReadingTime: [
        mockSubpost as unknown as CollectionEntry<'blog'> & {
          readingTime: string
        },
      ],
      isCurrentSubpost: false,
      currentSubpostDetails: null,
    })

    const container = await AstroContainer.create()
    const html = await container.renderToString(SubpostsHeader, {
      props: { parentId: 'parent-post' },
    })

    expect(html).toContain('id="mobile-subposts-container"')
    expect(html).toContain('Parent Post Overview')
    expect(html).toContain('First Subpost Chapter')
    expect(html).toContain('/blog/subpost-1')
  })
})
