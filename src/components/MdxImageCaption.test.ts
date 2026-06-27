import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import MdxImageCaption from './MdxImageCaption.astro'

describe('MdxImageCaption.astro (Test as Documentation)', () => {
  it('renders standard image tag for external URLs with optional caption', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(MdxImageCaption, {
      props: {
        src: 'https://example.com/test.png',
        alt: 'Sample Architecture Diagram',
      },
    })

    expect(html).toContain('<figure')
    expect(html).toContain('src="https://example.com/test.png"')
    expect(html).toContain('<figcaption')
    expect(html).toContain('Sample Architecture Diagram')
  })
})
