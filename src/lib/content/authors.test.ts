import { describe, it, expect, vi } from 'vitest'
import { getAllAuthors, parseAuthors } from './authors'
import { getCollection, getEntries } from 'astro:content'

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
  getEntries: vi.fn(),
}))

describe('authors', () => {
  it('getAllAuthors calls getCollection', async () => {
    vi.mocked(getCollection).mockResolvedValue(['author1'] as never)
    const authors = await getAllAuthors()
    expect(authors).toEqual(['author1'])
    expect(getCollection).toHaveBeenCalledWith('authors')
  })

  it('parseAuthors returns early if no refs', async () => {
    const authors = await parseAuthors()
    expect(authors).toEqual([])
  })

  it('parseAuthors maps author refs correctly', async () => {
    const mockRefs = [
      { collection: 'authors', id: 'a1' },
      { collection: 'authors', id: 'a2' },
    ] as never
    vi.mocked(getEntries).mockResolvedValue([
      { data: { name: 'Author One', avatar: '/avatar1.png' } },
      null, // test fallback
    ] as never)

    const parsed = await parseAuthors(mockRefs)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].name).toBe('Author One')
    expect(parsed[0].avatar).toBe('/avatar1.png')
    expect(parsed[0].isRegistered).toBe(true)

    // Fallback logic
    expect(parsed[1].name).toBe('a2')
    expect(parsed[1].avatar).toBe('/icon.webp')
    expect(parsed[1].isRegistered).toBe(false)
  })
})
