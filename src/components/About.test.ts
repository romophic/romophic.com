import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import About from './About.astro'
import * as consts from '@/consts'

vi.mock('@/lib/data-utils', () => ({
  getAllProjects: vi.fn().mockResolvedValue([]),
}))

describe('About.astro', () => {
  it('renders correctly and handles unknown social link fallback', async () => {
    const originalLinks = consts.SOCIAL_LINKS

    // Temporarily mock SOCIAL_LINKS to include an unknown label
    vi.spyOn(consts, 'SOCIAL_LINKS', 'get').mockReturnValue([
      ...originalLinks,
      { label: 'UnknownNetwork', href: 'https://example.com' },
    ])

    const container = await AstroContainer.create()
    const html = await container.renderToString(About)

    expect(html).toContain('About')
    expect(html).toContain('UnknownNetwork')
    expect(html).toContain('href="https://example.com"')

    vi.restoreAllMocks()
  })
})
