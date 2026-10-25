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

    // The header offers navigation and the theme toggle; search lives on
    // the blog list via the official pagefind component
    expect(html).not.toContain('toggleCommandMenu')
    expect(html).toContain('data-theme-toggle')
  })

  it('marks only the active section with aria-current="page"', async () => {
    const container = await AstroContainer.create()

    // Home is active only on the home page (not on every "/" prefix)
    const homeHtml = await container.renderToString(Header, {
      request: new Request('https://romophic.com/'),
    })
    const homeMatches = homeHtml.match(/<a[^>]*aria-current="page"[^>]*>/g)
    expect(homeMatches).toHaveLength(1)
    expect(homeMatches?.[0]).toContain('href="/"')

    // Inside /blog/... only the blog link is current, home is not
    const blogHtml = await container.renderToString(Header, {
      request: new Request('https://romophic.com/blog/some-post'),
    })
    const blogMatches = blogHtml.match(/<a[^>]*aria-current="page"[^>]*>/g)
    expect(blogMatches).toHaveLength(1)
    expect(blogMatches?.[0]).toContain('href="/blog"')
  })
})
