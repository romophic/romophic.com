import { describe, it, expect } from 'vitest'
import {
  stripScripts,
  stripStyles,
  stripKatexHtml,
  absolutizeUrls,
  sanitizeFeedHtml,
} from './feed-html'

const SITE = new URL('https://romophic.com/')

const KATEX_INLINE = [
  '<p>式 <span class="katex">',
  '<span class="katex-mathml"><math><mi>x</mi></math></span>',
  '<span class="katex-html" aria-hidden="true">',
  '<span class="base"><span class="mord mathnormal">x</span></span>',
  '</span>',
  '</span> です</p>',
].join('')

describe('stripScripts', () => {
  it('removes script tags while keeping surrounding markup', () => {
    expect(stripScripts('<p>a</p><script>alert(1)</script><p>b</p>')).toBe(
      '<p>a</p><p>b</p>',
    )
  })

  it('removes multiline script bodies', () => {
    expect(stripScripts('x<script>\nvar a = 1\n</script>y')).toBe('xy')
  })
})

describe('stripStyles', () => {
  it('removes inline styles and stylesheet links', () => {
    expect(
      stripStyles(
        '<style>.x{color:red}</style><link rel="stylesheet" href="/x.css"><p>x</p>',
      ),
    ).toBe('<p>x</p>')
  })
})

describe('stripKatexHtml', () => {
  it('keeps MathML and removes only the katex-html copy', () => {
    const result = stripKatexHtml(KATEX_INLINE)
    expect(result).toContain('<span class="katex-mathml">')
    expect(result).not.toContain('katex-html')
    expect(result).not.toContain('mord mathnormal')
    expect(result).toContain('式 ')
    expect(result).toContain(' です')
  })

  it('handles multiple formulas in one document', () => {
    const result = stripKatexHtml(KATEX_INLINE + '<hr>' + KATEX_INLINE)
    expect(result.match(/katex-mathml/g)).toHaveLength(2)
    expect(result).not.toContain('katex-html')
  })

  it('leaves documents without katex untouched', () => {
    expect(stripKatexHtml('<p>plain</p>')).toBe('<p>plain</p>')
  })
})

describe('absolutizeUrls', () => {
  it('rewrites root-relative src and href attributes', () => {
    const html = '<img src="/_astro/a.webp"><a href="/blog/x/">x</a>'
    expect(absolutizeUrls(html, SITE)).toBe(
      '<img src="https://romophic.com/_astro/a.webp">' +
        '<a href="https://romophic.com/blog/x/">x</a>',
    )
  })

  it('rewrites every candidate in a srcset', () => {
    const html =
      '<img srcset="/_astro/a.webp 400w, /_astro/b.webp 800w" src="/_astro/a.webp">'
    expect(absolutizeUrls(html, SITE)).toContain(
      'srcset="https://romophic.com/_astro/a.webp 400w, https://romophic.com/_astro/b.webp 800w"',
    )
  })

  it('leaves external, anchor, data and protocol-relative URLs untouched', () => {
    const html =
      '<a href="#sec">s</a><a href="https://x.dev/a">e</a><img src="data:image/png;base64,AA">'
    expect(absolutizeUrls(html, SITE)).toBe(html)
  })

  it('resolves fragment and relative URLs against the post URL', () => {
    const base = new URL('https://romophic.com/blog/example/')
    const html = '<a href="#sec">s</a><img src="img/a.png">'
    expect(absolutizeUrls(html, SITE, base)).toBe(
      '<a href="https://romophic.com/blog/example/#sec">s</a>' +
        '<img src="https://romophic.com/blog/example/img/a.png">',
    )
  })
})

describe('sanitizeFeedHtml', () => {
  it('composes stripping and absolutizing for feed output', () => {
    const base = new URL('https://romophic.com/blog/example/')
    const html =
      '<script>x</script><style>.x{}</style>' +
      KATEX_INLINE +
      '<img src="/i.png"><a href="#sec">s</a>'
    const result = sanitizeFeedHtml(html, SITE, base)
    expect(result).not.toContain('<script')
    expect(result).not.toContain('<style')
    expect(result).not.toContain('katex-html')
    expect(result).toContain('<span class="katex-mathml">')
    expect(result).toContain('src="https://romophic.com/i.png"')
    expect(result).toContain('href="https://romophic.com/blog/example/#sec"')
  })
})
