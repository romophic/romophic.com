import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, it, expect } from 'vitest'
import KatexStyles from './KatexStyles.astro'

describe('KatexStyles.astro', () => {
  it('renders an inline style element for KaTeX', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(KatexStyles)

    // Astro's test container does not process CSS imports, so the build is the
    // source of truth for the stylesheet contents.
    expect(html).toContain('<style>')
    expect(html).toContain('</style>')
  })
})
