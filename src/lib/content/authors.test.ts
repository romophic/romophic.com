/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { getAllAuthors, getPostsByAuthor, parseAuthors } from './authors'
import * as postsUtils from './posts'
import { getCollection, getEntries } from 'astro:content'

vi.mock('astro:content', () => ({
  getCollection: vi.fn(),
  getEntries: vi.fn(),
}))

vi.mock('./posts', () => ({
  getAllPosts: vi.fn(),
}))

describe('authors', () => {
  it('getAllAuthors calls getCollection', async () => {
    vi.mocked(getCollection).mockResolvedValue(['author1'] as any)
    const authors = await getAllAuthors()
    expect(authors).toEqual(['author1'])
    expect(getCollection).toHaveBeenCalledWith('authors')
  })

  it('getPostsByAuthor filters posts by author', async () => {
    vi.mocked(postsUtils.getAllPosts).mockResolvedValue([
      { id: '1', data: { authors: [{ id: 'a1' }] } },
      { id: '2', data: { authors: [{ id: 'a2' }] } },
      { id: '3', data: {} }, // missing authors array
    ] as any)

    const posts = await getPostsByAuthor('a1')
    expect(posts).toHaveLength(1)
    expect(posts[0].id).toBe('1')
  })

  it('parseAuthors returns early if no refs', async () => {
    const authors = await parseAuthors()
    expect(authors).toEqual([])
  })

  it('parseAuthors maps author refs correctly', async () => {
    const mockRefs = [
      { collection: 'authors', id: 'a1' },
      { collection: 'authors', id: 'a2' },
    ] as any
    vi.mocked(getEntries).mockResolvedValue([
      { data: { name: 'Author One', avatar: '/avatar1.png' } },
      null, // test fallback
    ] as any)

    const parsed = await parseAuthors(mockRefs)

    expect(parsed).toHaveLength(2)
    expect(parsed[0].name).toBe('Author One')
    expect(parsed[0].avatar).toBe('/avatar1.png')
    expect(parsed[0].isRegistered).toBe(true)

    // Fallback logic
    expect(parsed[1].name).toBe('a2')
    expect(parsed[1].avatar).toBe('/static/logo.png')
    expect(parsed[1].isRegistered).toBe(false)
  })
})
