/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { GET } from './llms-full.txt'
import * as dataUtils from '@/lib/data-utils'

vi.mock('@/lib/data-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/data-utils')>()
  return {
    ...actual,
    getAllPosts: vi.fn(),
  }
})

describe('llms-full.txt endpoint', () => {
  it('links to resolvable anchors and absolutizes relative images', async () => {
    vi.mocked(dataUtils.getAllPosts).mockResolvedValue([
      {
        id: 'series/part-1',
        body: '![diagram](img/diagram.webp)',
        data: {
          title: 'Part 1',
          description: 'First part',
          date: new Date('2026-01-01T00:00:00Z'),
          tags: [],
        },
      },
    ] as any)

    const response = await GET({
      site: new URL('https://romophic.com/'),
    } as any)
    const text = await response.text()

    expect(response.headers.get('Content-Type')).toBe(
      'text/plain; charset=utf-8',
    )
    expect(text).toContain('- [Part 1](#post-series-part-1)')
    expect(text).toContain('<a id="post-series-part-1"></a>')
    expect(text).toContain(
      '![diagram](https://romophic.com/blog/series/part-1/img/diagram.webp)',
    )
    expect(text).not.toContain('Tags: \n')
  })
})
