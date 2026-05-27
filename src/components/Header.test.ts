import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Header from './Header.astro'
import { SITE, NAV_LINKS } from '@/consts'

describe('Header.astro', () => {
  it('renders the site title and navigation links', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Header)

    // Check if site title is rendered
    expect(html).toContain(SITE.title)

    // Check if navigation links are rendered
    for (const link of NAV_LINKS) {
      expect(html).toContain(`href="${link.href}"`)
      expect(html).toContain(link.label.toLowerCase())
    }

    // Check if the theme toggle or command menu button exists (search icon)
    expect(html).toContain('aria-label="Open Command Menu"')
  })
})
