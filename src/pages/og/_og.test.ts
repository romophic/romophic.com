import { describe, test, expect, vi, beforeEach } from 'vitest'
import satori from 'satori'
import { GET, getStaticPaths } from './[...slug].png'
import { makeBlogPost } from '@/test-utils/make-post'

vi.mock('satori', () => ({
  default: vi.fn().mockResolvedValue('<svg></svg>'),
}))

vi.mock('@resvg/resvg-js', () => ({
  Resvg: class {
    render() {
      return {
        asPng: () => new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
      }
    }
  },
}))

// Mock astro:content so getStaticPaths works without real data
vi.mock('astro:content', () => {
  return {
    getCollection: vi.fn().mockResolvedValue([
      { id: 'parent-1', slug: 'parent-1', data: {} },
      { id: 'post-2', slug: 'post-2', data: { parent: { id: 'parent-1' } } },
    ]),
  }
})

describe('OG Image Generation ([...slug].png)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('getStaticPaths returns one path per post plus the default image', async () => {
    const paths = await getStaticPaths()
    expect(paths).toHaveLength(3)
    expect(paths[0].params.slug).toBe('parent-1') // slashes become dashes
    expect(paths[1].params.slug).toBe('post-2')
    expect(paths[2].params.slug).toBe('default')
  })

  test('generates a valid PNG image for a blog post', async () => {
    const response = await GET({ props: { post: makeBlogPost() } })

    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('Content-Type')).toBe('image/png')

    const arrayBuffer = await response.arrayBuffer()
    expect(arrayBuffer.byteLength).toBeGreaterThan(0)

    const uint8Array = new Uint8Array(arrayBuffer)
    expect(uint8Array[0]).toBe(0x89)
    expect(uint8Array[1]).toBe(0x50)
  })

  test('generates the default image when no post prop is given', async () => {
    const response = await GET({ props: {} })

    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('Content-Type')).toBe('image/png')
  })

  test('renders at 1200x630 with the bundled Noto Sans JP Bold font', async () => {
    await GET({ props: { post: makeBlogPost({ id: 'test-font-spec' }) } })

    expect(satori).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        width: 1200,
        height: 630,
        fonts: [
          expect.objectContaining({
            name: 'Noto Sans JP',
            weight: 700,
            style: 'normal',
          }),
        ],
      }),
    )
  })

  test('rejects when the bundled font cannot be read', async () => {
    vi.resetModules()
    vi.doMock('node:fs/promises', () => ({
      readFile: vi.fn().mockRejectedValue(new Error('font file missing')),
    }))

    const { GET: freshGET } = await import('./[...slug].png')

    await expect(
      freshGET({ props: { post: makeBlogPost({ id: 'test-font-missing' }) } }),
    ).rejects.toThrow('font file missing')

    vi.doUnmock('node:fs/promises')
  })
})
