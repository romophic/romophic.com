import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, it, expect } from 'vitest'
import ActivityGraph from './ActivityGraph.astro'

describe('ActivityGraph.astro', () => {
  it('renders the grid container and UI controls for the graph', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(ActivityGraph)

    // Check if the main graph container (CSS grid) exists
    expect(html).toContain('class="grid w-fit grid-flow-col grid-rows-7 gap-1"')

    // Check if the header "Activity" exists (using regex to ignore data-astro attributes)
    expect(html).toMatch(/<h3[^>]*>Activity<\/h3>/)

    // Check if the legend (Less/More) exists
    expect(html).toMatch(/<span[^>]*>Less<\/span>/)
    expect(html).toMatch(/<span[^>]*>More<\/span>/)
  })
})
