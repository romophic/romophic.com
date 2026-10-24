import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import SkipLink from './SkipLink.astro'

describe('SkipLink.astro (Test as Documentation)', () => {
  it('links to the main content by default and stays hidden until focused', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(SkipLink)

    expect(html).toContain('href="#main-content"')
    expect(html).toContain('Skip to content')
    // Hidden from view, but revealed and re-positioned on focus.
    expect(html).toContain('sr-only')
    expect(html).toContain('focus:not-sr-only')
    expect(html).toContain('focus:absolute')
  })

  it('supports a custom target', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(SkipLink, {
      props: { target: 'comments' },
    })

    expect(html).toContain('href="#comments"')
  })
})
