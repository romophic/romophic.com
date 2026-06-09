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
})
