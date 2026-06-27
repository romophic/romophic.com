import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import Favicons from './Favicons.astro'

describe('Favicons.astro (Test as Documentation)', () => {
  it('renders proper favicon and touch icon links', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Favicons)

    expect(html).toContain('href="/favicon-96x96.png"')
    expect(html).toContain('href="/favicon.ico"')
    expect(html).toContain('href="/apple-touch-icon.png"')
  })
})
