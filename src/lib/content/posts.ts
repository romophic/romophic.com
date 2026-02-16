import { getCollection, type CollectionEntry } from 'astro:content'
import readingTime from 'reading-time'

/** Internal cache store. Use resetPostsCache() to clear in tests. */
const _cache = {
  posts: null as CollectionEntry<'blog'>[] | null,
  topLevelPosts: null as CollectionEntry<'blog'>[] | null,
  allPostsAndSubposts: null as CollectionEntry<'blog'>[] | null,
  postMap: null as Map<string, CollectionEntry<'blog'>> | null,
}

/**
 * Reset all internal caches. Useful for testing.
 */
export function resetPostsCache() {
  _cache.posts = null
  _cache.topLevelPosts = null
  _cache.allPostsAndSubposts = null
  _cache.postMap = null
}

async function getCachedPosts(): Promise<CollectionEntry<'blog'>[]> {
  if (_cache.posts) return _cache.posts
  _cache.posts = await getCollection('blog')
  return _cache.posts
}

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  if (_cache.topLevelPosts) return _cache.topLevelPosts
  const posts = await getCachedPosts()
  _cache.topLevelPosts = posts
    .filter((post) => !post.data.draft && !isSubpost(post.id))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  return _cache.topLevelPosts
}

export async function getAllPostsAndSubposts(): Promise<
  CollectionEntry<'blog'>[]
> {
  if (_cache.allPostsAndSubposts) return _cache.allPostsAndSubposts
  const posts = await getCachedPosts()
  _cache.allPostsAndSubposts = posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  return _cache.allPostsAndSubposts
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
  const lastSlashIndex = subpostId.lastIndexOf('/')
  if (lastSlashIndex === -1) return ''
  return subpostId.substring(0, lastSlashIndex)
}

export async function getPostById(
  postId: string,
): Promise<CollectionEntry<'blog'> | null> {
  if (!_cache.postMap) {
    const allPosts = await getAllPostsAndSubposts()
    _cache.postMap = new Map(allPosts.map((p) => [p.id, p]))
  }
  return _cache.postMap.get(postId) ?? null
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
        ; (acc[year] ??= []).push(post)
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
  if (!post) return '0 min read'

  return readingTime(post.body || '').text
}

export async function getCombinedReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return '0 min read'

  let totalMinutes = readingTime(post.body || '').minutes

  if (!isSubpost(postId)) {
    const subposts = await getSubpostsForParent(postId)
    for (const subpost of subposts) {
      totalMinutes += readingTime(subpost.body || '').minutes
    }
  }

  return `${Math.ceil(totalMinutes)} min read`
}

/**
 * Returns a lightweight list of posts for the CommandMenu component.
 * Uses the internal cache to avoid redundant getCollection calls.
 */
export async function getPostsForCommandMenu(): Promise<
  { id: string; title: string; description: string; slug: string }[]
> {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    id: post.id,
    title: post.data.title,
    description: post.data.description,
    slug: post.id,
  }))
}
