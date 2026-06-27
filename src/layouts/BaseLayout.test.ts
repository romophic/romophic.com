import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import BaseLayout from './BaseLayout.astro'

describe('BaseLayout.astro (Test as Documentation)', () => {
  it('renders doctype, html lang="ja", Head, and body with SearchDialog', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(BaseLayout)

    expect(html).toContain('lang="ja"')
    expect(html).toContain('scheme-light-dark')
    expect(html).toContain('font-sans')
    expect(html).toContain('id="search-dialog"')
  })
})
