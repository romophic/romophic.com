import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Home from './Home.astro'
import * as consts from '@/consts'

describe('Home.astro', () => {
  it('renders the home page layout correctly', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/')
    const html = await container.renderToString(Home, { request })

    // Check for the dashboard content
    expect(html).toContain('id="dashboard-content"')

    // Check for the author name in the hero section
    expect(html).toContain('romophic')

    // Check for Activity Log header
    expect(html).toMatch(/<h2[^>]*>[\s\S]*Activity\s*Log[\s\S]*<\/h2>/)

    // Check for Latest Writings header
    expect(html).toMatch(/<h2[^>]*>[\s\S]*Latest\s*Writings[\s\S]*<\/h2>/)
  })

  it('renders correctly and handles unknown social link fallback', async () => {
    const originalLinks = consts.SOCIAL_LINKS

    // Temporarily mock SOCIAL_LINKS to include an unknown label
    vi.spyOn(consts, 'SOCIAL_LINKS', 'get').mockReturnValue([
      ...originalLinks,
      { label: 'UnknownNetwork', href: 'https://example.com' },
    ])

    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/')
    const html = await container.renderToString(Home, { request })

    expect(html).toContain('UnknownNetwork')
    expect(html).toContain('href="https://example.com"')

    vi.restoreAllMocks()
  })
})
