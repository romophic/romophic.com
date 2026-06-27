import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import type { CollectionEntry } from 'astro:content'
import ProjectCard from './ProjectCard.astro'

describe('ProjectCard.astro (Test as Documentation)', () => {
  it('renders project metadata, dates, description, and tags correctly', async () => {
    const container = await AstroContainer.create()
    const mockProject = {
      id: 'proj-1',
      data: {
        name: 'Romophic Core',
        description: 'Advanced Graph Visualization Engine',
        link: 'https://github.com/romophic/core',
        startDate: new Date('2023-01-01'),
        tags: ['TypeScript', 'D3.js'],
      },
    } as unknown as CollectionEntry<'projects'>

    const html = await container.renderToString(ProjectCard, {
      props: { project: mockProject },
    })

    expect(html).toContain('Romophic Core')
    expect(html).toContain('Advanced Graph Visualization Engine')
    expect(html).toContain('href="https://github.com/romophic/core"')
    expect(html).toContain('Present')
    expect(html).toContain('TypeScript')
    expect(html).toContain('D3.js')
  })
})
