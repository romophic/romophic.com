import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, it, expect } from 'vitest'
import Layout from './Layout.astro'

describe('Layout.astro', () => {
  it('renders the core layout elements including slot content', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/')
    const html = await container.renderToString(Layout, {
      request,
      slots: {
        default: '<div id="test-content">Hello World</div>',
      },
    })

    // Check if slot content is rendered inside the layout
    expect(html).toContain('<div id="test-content">Hello World</div>')

    // Check for essential layout elements (header, main, footer, dialog)
    expect(html).toContain('<header')
    expect(html).toContain('<main')
    expect(html).toContain('<footer')
    expect(html).toContain('<dialog') // SearchDialog

    // Check if basic HTML structure exists
    expect(html).toContain('<html')
    expect(html).toContain('<body')
  })
})
