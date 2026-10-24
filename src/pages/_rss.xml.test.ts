import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from './rss.xml'
import { SITE } from '@/consts'
import * as dataUtils from '@/lib/data-utils'
import * as feedHtml from '@/lib/content/feed-html'

vi.mock('@/lib/data-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data-utils')>()
  return {
    ...actual,
    getAllPosts: vi.fn().mockImplementation(actual.getAllPosts),
  }
})

vi.mock('@/lib/content/feed-html', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/content/feed-html')>()
  return {
    ...actual,
    renderPostContentHtml: vi.fn().mockResolvedValue('<p>Body</p>'),
  }
})

describe('rss.xml endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(feedHtml.renderPostContentHtml).mockResolvedValue('<p>Body</p>')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a valid RSS XML response', async () => {
    // Omitting site to cover the context.site ?? SITE.href fallback
    const mockContext = {} as never

    const response = await GET(mockContext)
    expect(response.status).toBe(200)

    const text = await response.text()
    expect(text).toContain('<?xml')
    expect(text).toContain('<rss')
    expect(text).toContain(`<title>${SITE.title}</title>`)
  })

  it('includes channel language and atom:updated for updated posts', async () => {
    vi.mocked(dataUtils.getAllPosts).mockResolvedValue([
      {
        id: 'post-1',
        data: {
          title: 'Post 1',
          description: 'Desc',
          date: new Date('2026-01-01T00:00:00Z'),
          updatedDate: new Date('2026-01-02T00:00:00Z'),
        },
      },
    ] as never)

    const response = await GET({
      site: new URL('https://romophic.com/'),
    } as never)
    const text = await response.text()

    expect(text).toContain(`<language>${SITE.locale}</language>`)
    expect(text).toContain('<lastBuildDate>')
    expect(text).toContain('<generator>Astro</generator>')
    expect(text).toContain(
      '<atom:link href="https://romophic.com/rss.xml" rel="self" type="application/rss+xml"/>',
    )
    expect(text).toContain(
      '<atom:updated>2026-01-02T00:00:00.000Z</atom:updated>',
    )
  })

  it('embeds sanitized full post content in content:encoded', async () => {
    vi.mocked(dataUtils.getAllPosts).mockResolvedValue([
      {
        id: 'post-1',
        data: {
          title: 'Post 1',
          description: 'Desc',
          date: new Date('2026-01-01T00:00:00Z'),
        },
      },
    ] as never)
    vi.mocked(feedHtml.renderPostContentHtml).mockResolvedValue(
      '<p>Body</p><script>evil()</script>',
    )

    const response = await GET({
      site: new URL('https://romophic.com/'),
    } as never)
    const text = await response.text()

    expect(text).toContain(
      'xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    )
    // The XML builder escapes the HTML payload; readers unescape it back.
    expect(text).toContain(
      '<content:encoded>&lt;p&gt;Body&lt;/p&gt;</content:encoded>',
    )
    expect(text).not.toContain('evil()')
  })

  it('keeps items without content:encoded when rendering fails', async () => {
    vi.mocked(dataUtils.getAllPosts).mockResolvedValue([
      {
        id: 'post-1',
        data: {
          title: 'Post 1',
          description: 'Desc',
          date: new Date('2026-01-01T00:00:00Z'),
        },
      },
    ] as never)
    vi.mocked(feedHtml.renderPostContentHtml).mockRejectedValueOnce(
      new Error('boom'),
    )
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const response = await GET({
      site: new URL('https://romophic.com/'),
    } as never)
    const text = await response.text()

    expect(response.status).toBe(200)
    expect(text).toContain('<title>Post 1</title>')
    expect(text).not.toContain('<content:encoded>')
    expect(warnSpy).toHaveBeenCalled()
  })

  it('handles errors gracefully and returns 500', async () => {
    // We mock getAllPosts to throw an error
    const mockContext = {
      site: new URL('https://romophic.com/'),
    } as never

    vi.mocked(dataUtils.getAllPosts).mockRejectedValue(
      new Error('Simulated Error'),
    )

    // Suppress console.error in tests and verify error logging
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await GET(mockContext)
    expect(response.status).toBe(500)
    expect(await response.text()).toBe('Error generating RSS feed')
    expect(consoleSpy).toHaveBeenCalled()
  })
})
