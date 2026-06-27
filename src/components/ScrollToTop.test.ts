import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import ScrollToTop from './ScrollToTop.astro'

describe('ScrollToTop.astro (Test as Documentation)', () => {
  it('renders scroll to top button with initial hidden opacity and pointer-events disabled', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(ScrollToTop)

    expect(html).toContain('id="scroll-to-top"')
    expect(html).toContain('aria-label="Scroll to top"')
    expect(html).toContain('opacity-0')
    expect(html).toContain('pointer-events-none')
    expect(html).toContain('SCROLL_TO_TOP_THRESHOLD')
  })
})
