import { getCollection, getEntries, type CollectionEntry } from 'astro:content'
import { getAllPosts } from './posts'
import type { Author } from '@/types'

export async function getAllAuthors(): Promise<CollectionEntry<'authors'>[]> {
  return await getCollection('authors')
}

export async function getPostsByAuthor(
  authorId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) =>
    post.data.authors?.some((a) => a.id === authorId),
  )
}

export async function parseAuthors(
  authorRefs: { collection: 'authors'; id: string }[] = [],
): Promise<Author[]> {
  if (!authorRefs.length) return []

  const authors = await getEntries(authorRefs)

  return authors.map((author, index) => {
    const refId = authorRefs[index].id
    return {
      id: refId,
      name: author?.data?.name || refId,
      avatar: author?.data?.avatar || '/static/logo.png',
      isRegistered: !!author,
    }
  })
}
