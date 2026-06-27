import { describe, it, expect } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import type { CollectionEntry } from 'astro:content'
import Backlinks from './Backlinks.astro'

describe('Backlinks.astro (Test as Documentation)', () => {
  it('does not render anything when backlinks array is empty', async () => {
    const container = await AstroContainer.create()
    const html = await container.renderToString(Backlinks, {
      props: { backlinks: [] },
    })

    expect(html.trim()).toBe('')
  })

  it('renders linked references when backlinks exist', async () => {
    const container = await AstroContainer.create()
    const mockBacklinks = [
      {
        id: 'post-1',
        data: {
          title: 'First Referring Post',
          description: 'Description of first post',
        },
      },
      {
        id: 'post-2',
        data: {
          title: 'Second Referring Post',
        },
      },
    ]

    const html = await container.renderToString(Backlinks, {
      props: {
        backlinks: mockBacklinks as unknown as CollectionEntry<'blog'>[],
      },
    })

    expect(html).toContain('Linked References')
    expect(html).toContain('/blog/post-1')
    expect(html).toContain('First Referring Post')
    expect(html).toContain('Description of first post')
    expect(html).toContain('/blog/post-2')
    expect(html).toContain('Second Referring Post')
  })
})
