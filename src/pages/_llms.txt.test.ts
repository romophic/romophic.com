/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { GET } from './llms.txt'
import { SITE } from '@/consts'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/data-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data-utils')>()
  return {
    ...actual,
    getAllPosts: vi.fn().mockImplementation(actual.getAllPosts),
    getAllProjects: vi.fn().mockImplementation(actual.getAllProjects),
    getAllAuthors: vi.fn().mockImplementation(actual.getAllAuthors),
  }
})

describe('llms.txt endpoint', () => {
  it('returns text content containing site title and core pages', async () => {
    const mockContext = {
      site: new URL('https://romophic.com/'),
    } as any

    const response = await GET(mockContext)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe(
      'text/plain; charset=utf-8',
    )

    const text = await response.text()
    expect(text).toContain(`# ${SITE.title}`)
    expect(text).toContain('Core Pages')
    expect(text).toContain('Latest Blog Posts')
  })

  it('renders correctly with more than 20 posts', async () => {
    // Generate 21 posts
    const mockPosts = Array.from({ length: 21 }).map((_, i) => ({
      id: `post-${i}`,
      data: { title: `Post ${i}`, description: 'Desc' },
    }))

    vi.mocked(dataUtils.getAllPosts).mockResolvedValue(mockPosts as any)
    vi.mocked(dataUtils.getAllProjects).mockResolvedValue([])
    vi.mocked(dataUtils.getAllAuthors).mockResolvedValue([])

    const request = new Request('https://romophic.com/llms.txt')
    const context = {
      request,
      url: new URL(request.url),
      site: new URL('https://romophic.com/'),
    } as any

    const result = await GET(context)
    const text = await result.text()

    expect(text).toContain('...and 1 more posts at')
  })
})
