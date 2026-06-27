import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Head from './Head.astro'

describe('Head.astro (Test as Documentation)', () => {
  it('renders viewport, generator, theme color, sitemap, and rss links inside head tag', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Head)

    expect(html).toContain('<head>')
    expect(html).toContain('name="viewport"')
    expect(html).toContain('name="generator"')
    expect(html).toContain('name="theme-color"')
    expect(html).toContain('href="/sitemap-index.xml"')
    expect(html).toContain('rss.xml')
  })
})
