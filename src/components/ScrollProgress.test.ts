import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import ScrollProgress from './ScrollProgress.astro'

describe('ScrollProgress.astro (Test as Documentation)', () => {
  it('renders custom element with progress bar and zero division guard', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(ScrollProgress)

    expect(html).toContain('<scroll-progress')
    expect(html).toContain('style="width: 0%"')
    expect(html).toContain('customElements.define(\'scroll-progress\'')
    expect(html).toContain('height > 0 ? (scrollTop / height) * 100 : 0')
  })
})
