import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import ThemeToggle from './ThemeToggle.astro'

describe('ThemeToggle.astro', () => {
  it('renders theme toggle buttons', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(ThemeToggle)

    expect(html).toContain('data-theme-toggle')
    expect(html).toContain('Toggle theme')
  })
})
