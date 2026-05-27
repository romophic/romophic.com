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
    expect(html).toContain(
      `<meta name="title" content="${customTitle} | ${SITE.title}">`,
    )
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
})
