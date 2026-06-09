/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import TOCSidebar from './TOCSidebar.astro'
import * as postsUtils from '@/lib/content/posts'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/content/posts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/content/posts')>()
  return { ...actual, getPostById: vi.fn() }
})
vi.mock('@/lib/data-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data-utils')>()
  return { ...actual, isSubpost: vi.fn() }
})

describe('TOCSidebar.astro', () => {
  it('renders a table of contents given headings', async () => {
    const mockSections = [
      {
        type: 'parent',
        headings: [
          { depth: 2, slug: 'heading-1', text: 'Heading 1' },
          { depth: 3, slug: 'heading-1-1', text: 'Heading 1.1' },
          { depth: 2, slug: 'heading-2', text: 'Heading 2' },
        ],
      },
    ]

    const container = await AstroContainer.create()
    const html = await container.renderToString(TOCSidebar, {
      props: { sections: mockSections, currentPostId: 'test-post' },
    })

    // Check for TOC elements
    expect(html).toContain('Heading 1')
    expect(html).toContain('href="#heading-1"')
    expect(html).toContain('Heading 1.1')
    expect(html).toContain('href="#heading-1-1"')
    expect(html).toContain('Heading 2')
    expect(html).toContain('href="#heading-2"')
  })

  it('renders subpost sections correctly', async () => {
    const mockSections = [
      {
        type: 'subpost',
        subpostId: 'parent-post',
        title: 'Parent Post',
        headings: [{ depth: 2, slug: 'parent-h2', text: 'Parent H2' }],
      },
      {
        type: 'subpost',
        subpostId: 'test-post',
        title: 'Current Post',
        headings: [
          { depth: 2, slug: 'h2', text: 'Current H2' },
          { depth: 3, slug: 'h3', text: 'Current H3' },
          { depth: 4, slug: 'h4', text: 'Current H4' },
        ],
      },
    ] as any

    const container = await AstroContainer.create()
    const html = await container.renderToString(TOCSidebar, {
      props: { sections: mockSections, currentPostId: 'test-post' },
    })

    // Subposts divider
    expect(html).toContain('Subposts')

    // Parent Post Link
    expect(html).toContain('Parent Post')
    expect(html).toContain('href="/blog/parent-post"')

    // Parent Post H2
    expect(html).toContain('Parent H2')
    expect(html).toContain('href="/blog/parent-post#parent-h2"')

    // Current Post (active state)
    expect(html).toContain('Current Post')
    expect(html).toContain('bg-muted/50') // Active state wrapper
    expect(html).toContain('href="#"') // Self-link to top

    // Current Post Headings
    expect(html).toContain('Current H2')
    expect(html).toContain('href="#h2"')
    expect(html).toContain('Current H3')
    expect(html).toContain('href="#h3"')
    expect(html).toContain('Current H4')
    expect(html).toContain('href="#h4"')
  })

  it('renders correctly when the current post is a subpost', async () => {
    vi.mocked(postsUtils.getPostById).mockResolvedValue({
      id: 'series/part-1',
      data: { parent: { id: 'series' } },
    } as any)
    vi.mocked(dataUtils.isSubpost).mockReturnValue(true)

    const mockSections = [
      {
        type: 'parent',
        headings: [
          { depth: 2, slug: 'h2', text: 'Parent H2' },
          { depth: 3, slug: 'h3', text: 'Parent H3' },
          { depth: 4, slug: 'h4', text: 'Parent H4' },
        ],
      },
    ] as any

    const container = await AstroContainer.create()
    const html = await container.renderToString(TOCSidebar, {
      props: { sections: mockSections, currentPostId: 'series/part-1' },
    })

    // Because it's a subpost, baseColor for parent headings becomes text-foreground/40
    expect(html).toContain('text-foreground/40')
    // Parent H2 gets subpost prefix link
    expect(html).toContain('href="/blog/series#h2"')
  })
})
