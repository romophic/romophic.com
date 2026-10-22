import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import SearchDialog from './SearchDialog.astro'

describe('SearchDialog.astro', () => {
  it('renders native Pagefind elements inside a labelled dialog', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(SearchDialog)

    expect(html).toContain('id="search-dialog"')
    expect(html).toContain('aria-label="Search"')
    expect(html).toContain('<pagefind-config bundle-path="/pagefind/">')
    expect(html).toContain('pagefind-searchbox')
    expect(html).toContain('show-sub-results="true"')
    expect(html).not.toContain('show-images')

    // Runtime status for slow/failed lazy loads.
    expect(html).toContain('id="search-status"')
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
  })
})
