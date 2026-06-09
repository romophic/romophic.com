import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import GraphView from './GraphView.astro'

describe('GraphView.astro', () => {
  it('renders correctly with default props', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(GraphView)

    expect(html).toContain('id="graph-container"')
    expect(html).toContain('data-full-interaction="true"')
    expect(html).toContain('cursor-move')
  })

  it('renders correctly with fullInteraction false', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(GraphView, {
      props: { fullInteraction: false },
    })

    expect(html).toContain('data-full-interaction="false"')
    expect(html).not.toContain('cursor-move')
  })
})
