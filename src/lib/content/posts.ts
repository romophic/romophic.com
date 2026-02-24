import { getCollection, type CollectionEntry } from 'astro:content'
import readingTime from 'reading-time'

/** Internal cache store. Use resetPostsCache() to clear in tests. */
const _cache = {
  posts: null as CollectionEntry<'blog'>[] | null,
  topLevelPosts: new Map<string, CollectionEntry<'blog'>[]>(),
  allPostsAndSubposts: new Map<string, CollectionEntry<'blog'>[]>(),
  postMap: null as Map<string, CollectionEntry<'blog'>> | null,
}

/**
 * Reset all internal caches. Useful for testing.
 */

async function getCachedPosts(): Promise<CollectionEntry<'blog'>[]> {
  if (_cache.posts) return _cache.posts
  _cache.posts = await getCollection('blog')
  return _cache.posts
}

export async function getAllPosts(
  lang: 'ja' | 'en' = 'ja',
): Promise<CollectionEntry<'blog'>[]> {
  if (_cache.topLevelPosts.has(lang)) return _cache.topLevelPosts.get(lang)!
  const posts = await getCachedPosts()
  const filtered = posts
    .filter(
      (post) =>
        !post.data.draft && !isSubpost(post.id) && post.data.lang === lang,
    )
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  _cache.topLevelPosts.set(lang, filtered)
  return filtered
}

export async function getAllPostsAndSubposts(
  lang: 'ja' | 'en' = 'ja',
): Promise<CollectionEntry<'blog'>[]> {
  if (_cache.allPostsAndSubposts.has(lang))
    return _cache.allPostsAndSubposts.get(lang)!
  const posts = await getCachedPosts()
  const filtered = posts
    .filter((post) => !post.data.draft && post.data.lang === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  _cache.allPostsAndSubposts.set(lang, filtered)
  return filtered
}

export async function getAllProjects(
  lang: 'ja' | 'en' = 'ja',
): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects
    .filter((project) => project.data.lang === lang)
    .sort((a, b) => {
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
    const allPostsJa = await getAllPostsAndSubposts('ja')
    const allPostsEn = await getAllPostsAndSubposts('en')
    _cache.postMap = new Map(
      [...allPostsJa, ...allPostsEn].map((p) => [p.id, p]),
    )
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
  const currentPost = await getPostById(currentId)
  if (!currentPost) return { newer: null, older: null, parent: null }
  const currentLang = currentPost.data.lang as 'ja' | 'en'

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

  const allPosts = await getAllPosts(currentLang)
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

export async function getAllTags(
  lang: 'ja' | 'en' = 'ja',
): Promise<Map<string, number>> {
  const posts = await getAllPosts(lang)
  return posts.reduce((acc, post) => {
    post.data.tags?.forEach((tag) => {
      acc.set(tag, (acc.get(tag) || 0) + 1)
    })
    return acc
  }, new Map<string, number>())
}

export async function getPostsByTag(
  tag: string,
  lang: 'ja' | 'en' = 'ja',
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts(lang)
  return posts.filter((post) => post.data.tags?.includes(tag))
}

export async function getRecentPosts(
  count: number,
  lang: 'ja' | 'en' = 'ja',
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getAllPosts(lang)
  return posts.slice(0, count)
}

export async function getSortedTags(
  lang: 'ja' | 'en' = 'ja',
): Promise<{ tag: string; count: number }[]> {
  const tagCounts = await getAllTags(lang)
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
