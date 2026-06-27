import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import TimelineItem from './TimelineItem.astro'

describe('TimelineItem.astro (Test as Documentation)', () => {
  it('renders title, period, description, and external links properly formatted', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(TimelineItem, {
      props: {
        title: 'Senior Developer',
        period: '2022 - Present',
        description: 'Led core infrastructure refactoring.',
        link: 'https://example.com',
        techs: ['TypeScript', 'Astro'],
      },
    })

    expect(html).toContain('Senior Developer')
    expect(html).toContain('2022 - Present')
    expect(html).toContain('Led core infrastructure refactoring.')
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('noopener noreferrer')
    expect(html).toContain('TypeScript')
    expect(html).toContain('Astro')
  })
})
