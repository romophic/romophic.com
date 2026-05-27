import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import SearchDialog from './SearchDialog.astro'

describe('SearchDialog.astro', () => {
  it('renders the search dialog with pagefind configuration', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(SearchDialog)

    expect(html).toContain('id="search-dialog"')
    expect(html).toContain('pagefind-searchbox')
  })
})
