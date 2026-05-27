import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import AboutPage from './about.astro'

describe('about.astro', () => {
  it('renders the about page correctly', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/about')
    const html = await container.renderToString(AboutPage, { request })

    // The About page component should be rendered
    expect(html).toMatch(/<h1[^>]*>About<\/h1>/i)
  })
})
