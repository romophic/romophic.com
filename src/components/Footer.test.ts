import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Footer from './Footer.astro'
import { SITE, SOCIAL_LINKS } from '@/consts'

describe('Footer.astro', () => {
  it('renders the site title, current year, and social links', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Footer)

    // Check if site title is rendered
    expect(html).toContain(SITE.title)

    // Check for the copyright year
    const currentYear = new Date().getFullYear()
    expect(html).toContain(`&copy; ${currentYear}`)

    // Check for social links
    for (const link of SOCIAL_LINKS) {
      expect(html).toContain(`href="${link.href}"`)
    }
  })
})
