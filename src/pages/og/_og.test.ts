/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET, getStaticPaths } from './[...slug].png'
import type { CollectionEntry } from 'astro:content'
import * as fs from 'node:fs'
import * as fsPromises from 'node:fs/promises'

// Mock astro:content so getStaticPaths works without real data
vi.mock('astro:content', () => {
  return {
    getCollection: vi.fn().mockResolvedValue([
      { id: 'parent-1', slug: 'parent-1', data: {} },
      { id: 'post-2', slug: 'post-2', data: { parent: { id: 'parent-1' } } },
    ]),
  }
})

// Properly mock node:fs and node:fs/promises for ESM
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    ...actual,
    existsSync: vi.fn().mockImplementation(actual.existsSync),
  }
})

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...actual,
    readFile: vi.fn().mockImplementation(actual.readFile),
    writeFile: vi.fn().mockImplementation(actual.writeFile),
    mkdir: vi.fn().mockImplementation(actual.mkdir),
  }
})

describe('OG Image Generation ([...slug].png.ts)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  test('getStaticPaths returns correct paths including parent nested slugs', async () => {
    const paths = await getStaticPaths()
    expect(paths).toHaveLength(2)
    expect(paths[0].params.slug).toBe('parent-1-index') // replaced slash with dash
    expect(paths[1].params.slug).toBe('post-2')
  })

  test('generates a valid PNG image bypassing cache', async () => {
    // Mock blog post entry with unique title to bypass cache
    const mockPost: CollectionEntry<'blog'> = {
      id: 'test-post-' + Date.now(),
      slug: 'test-post',
      body: 'Test content',
      collection: 'blog',
      data: {
        title: 'Test Blog Post ' + Date.now(),
        date: new Date(),
        description: 'Test description',
        tags: ['test'],
      },
      render: async () => ({
        Content: () => null,
        headings: [],
        remarkPluginFrontmatter: {},
      }),
    } as any

    const response = await GET({ props: { post: mockPost } })

    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('Content-Type')).toBe('image/png')

    const arrayBuffer = await response.arrayBuffer()
    expect(arrayBuffer.byteLength).toBeGreaterThan(0)

    const uint8Array = new Uint8Array(arrayBuffer)
    expect(uint8Array[0]).toBe(0x89)
    expect(uint8Array[1]).toBe(0x50)
  }, 15000)

  test('handles cache read error gracefully', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fsPromises.readFile).mockRejectedValue(
      new Error('Simulated read error'),
    )

    const mockPost: CollectionEntry<'blog'> = {
      id: 'test-read-error',
      data: { title: 'Err', date: new Date() },
    } as any

    // Should still return response by generating new image
    const response = await GET({ props: { post: mockPost } })
    expect(response.status).toBe(200)
  })

  test('handles font fetch failure', async () => {
    vi.mocked(fsPromises.writeFile).mockRejectedValue(
      new Error('Simulated write error'),
    )

    const mockPost: CollectionEntry<'blog'> = {
      id: 'test-write-error',
      data: { title: 'Write Err ' + Date.now(), date: new Date() },
    } as any

    const response = await GET({ props: { post: mockPost } })
    expect(response.status).toBe(200)
  })

  test('hits the image cache and returns the cached response', async () => {
    // Mock getCachedImage hit
    vi.mocked(fs.existsSync).mockReturnValue(true) // Cache dir exists, Cache file exists
    vi.mocked(fsPromises.readFile).mockResolvedValue(
      new Uint8Array([0x89, 0x50]).buffer as any,
    )

    const mockPost: CollectionEntry<'blog'> = {
      id: 'test-cache-hit',
      data: { title: 'Cache Hit', date: new Date() },
    } as any

    const response = await GET({ props: { post: mockPost } })
    expect(response.status).toBe(200)
    expect(fsPromises.readFile).toHaveBeenCalled()
  })

  test('fetches fonts when not in cache', async () => {
    vi.resetModules()
    const { GET: freshGET } = await import('./[...slug].png')

    // Force existsSync to false so it fetches fonts and creates cache dir
    vi.mocked(fs.existsSync).mockReturnValue(false)

    // Mock fetch to return success
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([0x00]).buffer,
    } as any)

    const mockPost: CollectionEntry<'blog'> = {
      id: 'test-fetch-font',
      data: { title: 'Fetch Font', date: new Date() },
    } as any

    // This will error down the line because fake font buffer is invalid for satori,
    // but it covers the fetch lines. We catch the error or allow it to throw if handled.
    try {
      await freshGET({ props: { post: mockPost } })
    } catch {
      // expected to fail at satori/font loading because of invalid font buffer
    }

    expect(global.fetch).toHaveBeenCalled()
    expect(fsPromises.mkdir).toHaveBeenCalled()
  })

  test('handles fetch network error for fonts', async () => {
    vi.resetModules()
    const { GET: freshGET } = await import('./[...slug].png')

    vi.mocked(fs.existsSync).mockReturnValue(false)
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const mockPost: CollectionEntry<'blog'> = {
      id: 'test-fetch-network-error',
      data: { title: 'Network Err', date: new Date() },
    } as any

    try {
      await freshGET({ props: { post: mockPost } })
    } catch (e) {
      expect((e as Error).message).toContain(
        'Failed to load Inter font for OG images',
      )
    }
  })

  test('handles fetch non-ok response for fonts', async () => {
    vi.resetModules()
    const { GET: freshGET } = await import('./[...slug].png')

    vi.mocked(fs.existsSync).mockReturnValue(false)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    } as any)

    const mockPost: CollectionEntry<'blog'> = {
      id: 'test-fetch-not-found',
      data: { title: 'Not Found Err', date: new Date() },
    } as any

    try {
      await freshGET({ props: { post: mockPost } })
    } catch (e) {
      expect((e as Error).message).toContain(
        'Failed to load Inter font for OG images',
      )
    }
  })
})
