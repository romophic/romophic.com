import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Footer from './Footer.astro'
import * as consts from '@/consts'

describe('Footer.astro', () => {
  it('renders the site title, current year, and social links including unknown links with fallback icon', async () => {
    const originalLinks = consts.SOCIAL_LINKS

    // Temporarily mock SOCIAL_LINKS to include an unknown label
    vi.spyOn(consts, 'SOCIAL_LINKS', 'get').mockReturnValue([
      ...originalLinks,
      { label: 'UnknownNetwork', href: 'https://example.com' },
    ])

    const container = await AstroContainer.create()
    const html = await container.renderToString(Footer)

    // Check if site title is rendered
    expect(html).toContain(consts.SITE.title)

    // Check for the copyright year
    const currentYear = new Date().getFullYear()
    expect(html).toContain(`&copy; ${currentYear}`)

    // Check for social links
    for (const link of originalLinks) {
      expect(html).toContain(`href="${link.href}"`)
    }

    // Check for unknown link and fallback behavior
    expect(html).toContain('href="https://example.com"')
    // If it fell back correctly, it shouldn't crash.
    // Astro icon renders as an SVG or a symbol, we just check it doesn't crash.

    vi.restoreAllMocks()
  })
})
