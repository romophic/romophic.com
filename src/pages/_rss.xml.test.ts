/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from './rss.xml'
import { SITE } from '@/consts'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/data-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data-utils')>()
  return {
    ...actual,
    getAllPosts: vi.fn().mockImplementation(actual.getAllPosts),
  }
})

describe('rss.xml endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a valid RSS XML response', async () => {
    // Omitting site to cover the context.site ?? SITE.href fallback
    const mockContext = {} as any

    const response = await GET(mockContext)
    expect(response.status).toBe(200)

    const text = await response.text()
    expect(text).toContain('<?xml')
    expect(text).toContain('<rss')
    expect(text).toContain(`<title>${SITE.title}</title>`)
  })

  it('handles errors gracefully and returns 500', async () => {
    // We mock getAllPosts to throw an error
    const mockContext = {
      site: new URL('https://romophic.com/'),
    } as any

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
