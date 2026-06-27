import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import AppScript from './AppScript.astro'

describe('AppScript.astro (Test as Documentation)', () => {
  it('renders inline script for theme initialization and bundled giscus script', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(AppScript)

    expect(html).toContain('localStorage.getItem(\'theme\')')
    expect(html).toContain('astro:before-swap')
    expect(html).toContain('AppScript.astro?astro&type=script')
  })
})
