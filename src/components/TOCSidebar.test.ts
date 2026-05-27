import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import TOCSidebar from './TOCSidebar.astro'

describe('TOCSidebar.astro', () => {
  it('renders a table of contents given headings', async () => {
    const mockSections = [
      {
        type: 'parent',
        headings: [
          { depth: 2, slug: 'heading-1', text: 'Heading 1' },
          { depth: 3, slug: 'heading-1-1', text: 'Heading 1.1' },
          { depth: 2, slug: 'heading-2', text: 'Heading 2' },
        ]
      }
    ]

    const container = await AstroContainer.create()
    const html = await container.renderToString(TOCSidebar, {
      props: { sections: mockSections, currentPostId: 'test-post' }
    })

    // Check for TOC elements
    expect(html).toContain('Heading 1')
    expect(html).toContain('href="#heading-1"')
    expect(html).toContain('Heading 1.1')
    expect(html).toContain('href="#heading-1-1"')
    expect(html).toContain('Heading 2')
    expect(html).toContain('href="#heading-2"')
  })
})
