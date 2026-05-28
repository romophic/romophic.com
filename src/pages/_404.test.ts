import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import NotFoundPage from './404.astro'

describe('404.astro', () => {
  it('renders the 404 page correctly', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/random-url-not-found')
    const html = await container.renderToString(NotFoundPage, { request })

    // Check for 404 header
    expect(html).toContain('404')
    expect(html).toContain('Page not found')
    
    // Check for buttons
    expect(html).toContain('Go Home')
    expect(html).toContain('href="/"')
  })
})
