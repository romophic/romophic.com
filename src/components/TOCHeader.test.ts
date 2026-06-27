import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import TOCHeader from './TOCHeader.astro'

describe('TOCHeader.astro (Test as Documentation)', () => {
  it('renders mobile-toc custom element with headings list and progress circle', async () => {
    const container = await AstroContainer.create()
    const mockHeadings = [
      { depth: 2, slug: 'getting-started', text: 'Getting Started' },
      { depth: 3, slug: 'installation', text: 'Installation' },
    ]

    const html = await container.renderToString(TOCHeader, {
      props: { headings: mockHeadings },
    })

    expect(html).toContain('<mobile-toc')
    expect(html).toContain('id="mobile-toc-progress-circle"')
    expect(html).toContain('href="#getting-started"')
    expect(html).toContain('Getting Started')
    expect(html).toContain('href="#installation"')
    expect(html).toContain('Installation')
  })
})
