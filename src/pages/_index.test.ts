import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import IndexPage from './index.astro'

describe('index.astro (Test as Documentation)', () => {
  it('renders the Home component correctly on root index', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(IndexPage)

    expect(html).toContain('Romophic')
    expect(html).toContain('Latest Blog Posts')
  })
})
