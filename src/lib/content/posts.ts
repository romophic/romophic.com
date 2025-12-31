import { getCollection, type CollectionEntry } from 'astro:content'
import { readingTime, calculateWordCountFromHtml } from '@/lib/utils'

let _postsCache: CollectionEntry<'blog'>[] | null = null

async function getCachedPosts(): Promise<CollectionEntry<'blog'>[]> {
  if (_postsCache) return _postsCache
  _postsCache = await getCollection('blog')
  return _postsCache
}

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCachedPosts()
  return posts
    .filter((post) => !post.data.draft && !isSubpost(post.id))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllPostsAndSubposts(): Promise<
  CollectionEntry<'blog'>[]
> {
  const posts = await getCachedPosts()
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects.sort((a, b) => {
    const dateA = a.data.startDate?.getTime() || 0
    const dateB = b.data.startDate?.getTime() || 0
    return dateB - dateA
  })
}

export function isSubpost(postId: string): boolean {
  return postId.includes('/')
}

export function getParentId(subpostId: string): string {
  return subpostId.split('/')[0]
}

export async function getPostById(
  postId: string,
): Promise<CollectionEntry<'blog'> | null> {
  const allPosts = await getAllPostsAndSubposts()
  return allPosts.find((post) => post.id === postId) || null
}

export async function getSubpostsForParent(
  parentId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCachedPosts()
  return posts
    .filter(
      (post) =>
        !post.data.draft &&
        isSubpost(post.id) &&
        getParentId(post.id) === parentId,
    )
    .sort((a, b) => {
      const orderA = a.data.order ?? 0
      const orderB = b.data.order ?? 0
      const orderDiff = orderA - orderB
      if (orderDiff !== 0) return orderDiff

      return a.data.date.valueOf() - b.data.date.valueOf()
    })
}

export async function getAdjacentPosts(currentId: string): Promise<{
  newer: CollectionEntry<'blog'> | null
  older: CollectionEntry<'blog'> | null
  parent: CollectionEntry<'blog'> | null
}> {
  if (isSubpost(currentId)) {
    const parentId = getParentId(currentId)
    const parent = (await getPostById(parentId)) || null

    const subposts = await getSubpostsForParent(parentId)

    const currentIndex = subposts.findIndex((post) => post.id === currentId)
    if (currentIndex === -1) {
      return { newer: null, older: null, parent }
    }

    return {
      newer:
        currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
      older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
      parent,
    }
  }

  const allPosts = await getAllPosts()
  const currentIndex = allPosts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) {
    return { newer: null, older: null, parent: null }
  }

  return {
    newer: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
    older:
      currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
    parent: null,
  }
}

export async function getAllTags(): Promise<Map<string, number>> {
  const posts = await getAllPosts()
  return posts.reduce((acc, post) => {
    post.data.tags?.forEach((tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

export async function getPostsByTag(
  tag: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.data.tags?.includes(tag))
}

export async function getRecentPosts(
  count: number,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts()
  return posts.slice(0, count)
}

export async function getSortedTags(): Promise<
  { tag: string; count: number }[]
> {
  const tagCounts = await getAllTags()
  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count
      return countDiff !== 0 ? countDiff : a.tag.localeCompare(b.tag)
    })
}

export function groupPostsByYear(
  posts: CollectionEntry<'blog'>[],
): Record<string, CollectionEntry<'blog'>[]> {
  return posts.reduce(
    (acc: Record<string, CollectionEntry<'blog'>[]>, post) => {
      const year = post.data.date.getFullYear().toString()
      ;(acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}

export async function hasSubposts(postId: string): Promise<boolean> {
  const subposts = await getSubpostsForParent(postId)
  return subposts.length > 0
}

export async function getParentPost(
  subpostId: string,
): Promise<CollectionEntry<'blog'> | null> {
  if (!isSubpost(subpostId)) {
    return null
  }
  const parentId = getParentId(subpostId)
  return await getPostById(parentId)
}

export async function getSubpostCount(parentId: string): Promise<number> {
  const subposts = await getSubpostsForParent(parentId)
  return subposts.length
}

export async function getPostReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return readingTime(0)

  const wordCount = calculateWordCountFromHtml(post.body)
  return readingTime(wordCount)
}

export async function getCombinedReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return readingTime(0)

  let totalWords = calculateWordCountFromHtml(post.body)

  if (!isSubpost(postId)) {
    const subposts = await getSubpostsForParent(postId)
    for (const subpost of subposts) {
      totalWords += calculateWordCountFromHtml(subpost.body)
    }
  }

  return readingTime(totalWords)
}
