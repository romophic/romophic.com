import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import GiscusComments from './GiscusComments.astro'

describe('GiscusComments.astro (Test as Documentation)', () => {
  it('renders the official .giscus container that the client script fills', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(GiscusComments)

    expect(html).toContain('id="comments-section"')
    expect(html).toContain('class="giscus"')
    // The id becomes the #comments anchor in the embed origin, matching how
    // the previous custom-element setup registered its discussions.
    expect(html).toContain('id="comments"')

    // No custom element and no baked-in theme: the embed script is injected on
    // astro:page-load and reads data-theme at that moment (see src/lib/giscus.ts).
    expect(html).not.toContain('giscus-widget')
    expect(html).not.toMatch(/theme="(light|transparent_dark)"/)
  })

  it('ships the mount logic as a bundled client script', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(GiscusComments)

    expect(html).toContain('GiscusComments.astro?astro&type=script')
  })
})
