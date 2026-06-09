import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import SocialIcons from './SocialIcons.astro'

describe('SocialIcons.astro', () => {
  it('renders correctly and handles unknown social link fallback', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(SocialIcons, {
      props: {
        links: [{ label: 'UnknownNetwork', href: 'https://example.com' }],
      },
    })

    expect(html).toContain('UnknownNetwork')
    expect(html).toContain('href="https://example.com"')
  })
})
