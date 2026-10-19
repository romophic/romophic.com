import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import AppScript from './AppScript.astro'

describe('AppScript.astro (Test as Documentation)', () => {
  it('renders inline theme bootstrap and swap propagation', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(AppScript)

    expect(html).toContain("localStorage.getItem('theme')")
    expect(html).toContain("classList.add('dark')")
    expect(html).toContain('astro:before-swap')
  })

  it('stays inline-only: third-party widgets own their own lifecycle scripts', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(AppScript)

    expect(html).not.toContain('giscus')
    expect(html).not.toContain('type=script')
  })
})
