import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import GiscusComments from './GiscusComments.astro'
import { GISCUS_CONFIG } from '@/consts'

describe('GiscusComments.astro', () => {
  it('renders giscus-widget with correct configuration', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(GiscusComments)

    expect(html).toContain('id="comments-section"')
    expect(html).toContain('giscus-widget')

    // Check key attributes
    expect(html).toContain(`repo="${GISCUS_CONFIG.repo}"`)
    expect(html).toContain(`repoid="${GISCUS_CONFIG.repoId}"`)
    expect(html).toContain(`category="${GISCUS_CONFIG.category}"`)
    expect(html).toContain(`categoryid="${GISCUS_CONFIG.categoryId}"`)
    expect(html).toContain(`mapping="${GISCUS_CONFIG.mapping}"`)
    expect(html).toContain(`strict="${GISCUS_CONFIG.strict}"`)
  })

  it('pins the theme attribute at parse time so the lazy iframe never boots light in dark mode', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(GiscusComments)

    // The theme must not be a static attribute (it depends on the stored
    // preference), and it must not depend on astro:page-load alone: that runs
    // at window.load, after the widget already snapshotted its default theme.
    expect(html).not.toMatch(/theme="(light|transparent_dark)"/)
    expect(html).toContain(
      "document.documentElement.classList.contains('dark')",
    )
    expect(html).toContain("widget.setAttribute('theme'")
    expect(html).toContain("'transparent_dark'")
  })
})
