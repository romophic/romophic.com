import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, it, expect } from 'vitest'
import Separator from './separator.astro'

describe('separator.astro', () => {
  it('renders default horizontal decorative separator', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Separator)

    expect(html).toContain('role="none"')
    expect(html).toContain('h-[1px] w-full')
    expect(html).not.toContain('aria-orientation')
  })

  it('renders vertical separator', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Separator, {
      props: { orientation: 'vertical' },
    })

    expect(html).toContain('h-full w-[1px]')
    expect(html).toContain('aria-orientation="vertical"')
  })

  it('renders non-decorative separator with correct role', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Separator, {
      props: { decorative: false },
    })

    expect(html).toContain('role="separator"')
  })

  it('applies custom class', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Separator, {
      props: { class: 'custom-class' },
    })

    expect(html).toContain('custom-class')
  })
})
