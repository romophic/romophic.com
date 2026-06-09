/* eslint-disable @typescript-eslint/no-explicit-any */
import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { describe, it, expect } from 'vitest'
import PageHead from './PageHead.astro'
import { SITE } from '@/consts'

describe('PageHead.astro', () => {
  it('renders default title and description for home page', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/')
    const html = await container.renderToString(PageHead, { request })

    expect(html).toContain(`<title>${SITE.title}</title>`)
    expect(html).toContain(
      `<meta name="description" content="${SITE.description}">`,
    )
    expect(html).toContain(
      `<meta property="og:site_name" content="${SITE.title}">`,
    )
  })

  it('renders custom title and does not duplicate SITE.title', async () => {
    const container = await AstroContainer.create()
    const customTitle = 'Custom Page'
    const request = new Request('https://romophic.com/')
    const html = await container.renderToString(PageHead, {
      request,
      props: { title: customTitle },
    })

    expect(html).toContain(`<title>${customTitle} | ${SITE.title}</title>`)
  })

  it('adds noindex robots tag when noindex prop is true', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/')
    const html = await container.renderToString(PageHead, {
      request,
      props: { noindex: true },
    })

    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
  })

  it('renders custom image if provided', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/')
    const html = await container.renderToString(PageHead, {
      request,
      props: { image: '/custom-image.png' },
    })

    expect(html).toContain(
      '<meta property="og:image" content="https://romophic.com/custom-image.png">',
    )
  })

  it('renders blog post specific metadata and structured data', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/blog/test')

    // Mock blog post entry
    const mockPost = {
      id: 'test-post',
      slug: 'test-post',
      collection: 'blog',
      data: {
        title: 'Test Blog Post',
        description: 'Post description',
        date: new Date('2024-01-01T00:00:00Z'),
        updatedDate: new Date('2024-01-02T00:00:00Z'),
        authors: [{ collection: 'authors', id: 'Test Author' }],
        tags: ['Astro', 'Test'],
        image: {
          src: '/blog-image.png',
          width: 800,
          height: 600,
          format: 'png',
        },
      },
    } as any

    const html = await container.renderToString(PageHead, {
      request,
      props: { post: mockPost },
    })

    // OG type should be article
    expect(html).toContain('<meta property="og:type" content="article">')

    // Should use post specific image
    expect(html).toContain(
      '<meta property="og:image" content="https://romophic.com/blog-image.png">',
    )

    // Should include authors
    expect(html).toContain('<meta property="og:author" content="Test Author">')

    // Should include tags
    expect(html).toContain('<meta property="article:tag" content="Astro">')
    expect(html).toContain('<meta property="article:tag" content="Test">')

    // Should include article JSON-LD schema
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"Article"')
    expect(html).toContain('"headline":"Test Blog Post"')

    // Should include breadcrumb JSON-LD
    expect(html).toContain('"@type":"BreadcrumbList"')
  })

  it('renders blog post fallback metadata when authors/updatedDate/image are missing', async () => {
    const container = await AstroContainer.create()
    const request = new Request('https://romophic.com/blog/test2')

    // Mock minimal blog post
    const mockPost = {
      id: 'test-post-minimal',
      slug: 'test-post-minimal',
      collection: 'blog',
      data: {
        title: 'Minimal Post',
        date: new Date('2024-01-01T00:00:00Z'),
      },
    } as any

    const html = await container.renderToString(PageHead, {
      request,
      props: { post: mockPost },
    })

    // Should fallback to default image
    expect(html).toContain(
      '<meta property="og:image" content="https://romophic.com/static/1200x630.png">',
    )
  })
})
