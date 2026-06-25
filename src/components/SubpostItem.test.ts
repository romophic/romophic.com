import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import SubpostItem from './SubpostItem.astro'
import * as dataUtils from '@/lib/data-utils'
vi.mock('@/lib/data-utils')
vi.mock('astro-icon/components', async () => {
  const mock = await import('./__mocks__/Mock.astro')
  return { Icon: mock.default }
})

describe('SubpostItem.astro', () => {
  it('renders a subpost item correctly', async () => {
    vi.mocked(dataUtils.getCombinedReadingTime).mockResolvedValue('3 min read')

    const container = await AstroContainer.create()
    const html = await container.renderToString(SubpostItem, {
      props: {
        title: 'Child Post',
        href: '/blog/parent/child',
        readingTime: '3 min read',
        isActive: false,
        icon: 'lucide:file',
        activeIcon: 'lucide:file-text',
      },
    })

    expect(html).toContain('Child Post')
    expect(html).toContain('href="/blog/parent/child"')
    expect(html).toContain('3 min read')
  })
})
