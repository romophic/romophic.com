import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Hero from './Hero.astro'

describe('Hero.astro', () => {
  it('renders the avatar and the title', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Hero)

    // Check for the title
    expect(html).toContain('romophic')

    // Check for the avatar image
    expect(html).toContain('alt="romophic avatar"')

    // Check for the "About Me" link
    expect(html).toContain('href="/about"')
    expect(html).toContain('About Me')
  })
})
