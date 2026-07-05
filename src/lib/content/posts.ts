import { getCollection, getEntry, type CollectionEntry } from 'astro:content'

// Module-level cache: getCollection is only called once per build
let _cache: CollectionEntry<'blog'>[] | null = null

/**
 * Get all posts, normalizing IDs.
 * Removes /index suffixes for clean routing.
 * Result is cached for the lifetime of the build.
 */
export async function getNormalizedPosts(): Promise<CollectionEntry<'blog'>[]> {
  if (_cache) return _cache
  const rawPosts = await getCollection('blog', ({ data }) => !data.draft)
  _cache = rawPosts.map((post) => ({
    ...post,
    id: post.id.replace(/\/index$/, ''),
  }))
  return _cache
}

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getNormalizedPosts()
  return [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects')
  return projects.sort((a, b) => {
    const dateA = a.data.startDate?.getTime() || 0
    const dateB = b.data.startDate?.getTime() || 0
    return dateB - dateA
  })
}

export function isSubpost(post: CollectionEntry<'blog'>): boolean {
  return post.data.parent !== undefined || post.id.includes('/')
}

export function getParentId(post: CollectionEntry<'blog'>): string {
  if (post.data.parent) return post.data.parent.id.replace(/\/index$/, '')
  if (post.id.includes('/')) return post.id.split('/')[0]
  return ''
}

export async function getPostById(
  postId: string,
): Promise<CollectionEntry<'blog'> | null> {
  const posts = await getNormalizedPosts()
  return posts.find((p) => p.id === postId) ?? null
}

export async function getSubpostsForParent(
  parentId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getNormalizedPosts()
  return posts
    .filter(
      (post) =>
        isSubpost(post) && getParentId(post) === parentId,
    )
    .sort((a, b) => {
      const orderDiff = (a.data.order ?? 0) - (b.data.order ?? 0)
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

  if (isSubpost(currentPost)) {
    const parentId = getParentId(currentPost)
    const parent = (await getPostById(parentId)) || null
    const subposts = await getSubpostsForParent(parentId)
    const currentIndex = subposts.findIndex((post) => post.id === currentId)

    if (currentIndex === -1) return { newer: null, older: null, parent }

    return {
      newer:
        currentIndex < subposts.length - 1 ? subposts[currentIndex + 1] : null,
      older: currentIndex > 0 ? subposts[currentIndex - 1] : null,
      parent,
    }
  }

  const allPosts = await getAllPosts()
  const currentIndex = allPosts.findIndex((post) => post.id === currentId)

  if (currentIndex === -1) return { newer: null, older: null, parent: null }

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
  const post = await getPostById(subpostId)
  if (!post) return null
  if (post.data.parent) {
    const parentEntry = await getEntry(post.data.parent)
    if (parentEntry) {
      return {
        ...parentEntry,
        id: parentEntry.id.replace(/\/index$/, ''),
      }
    }
  }
  const parentId = getParentId(post)
  if (!parentId) return null
  return getPostById(parentId)
}

export async function getSubpostCount(parentId: string): Promise<number> {
  const subposts = await getSubpostsForParent(parentId)
  return subposts.length
}

/** Returns reading time in minutes as a number. */
export function calculateReadingTimeMinutes(body: string): number {
  if (!body) return 1
  const chars = body.replace(/\s+/g, '').length
  // Avg Japanese/English technical reading speed is ~400 chars/min
  return Math.max(1, Math.ceil(chars / 400))
}

/** Formats reading time in minutes for display, e.g. "5 min read". */
export function formatReadingTime(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || minutes <= 0)
    return '0 min read'
  return `${minutes} min read`
}

export async function getPostReadingTime(postId: string): Promise<number> {
  const post = await getPostById(postId)
  if (!post) return 0
  return calculateReadingTimeMinutes(post.body || '')
}

export async function getCombinedReadingTime(
  postId: string,
): Promise<number | null> {
  const post = await getPostById(postId)
  if (!post) return null

  let totalMinutes = calculateReadingTimeMinutes(post.body || '')

  if (!isSubpost(post)) {
    const subposts = await getSubpostsForParent(postId)
    for (const subpost of subposts) {
      totalMinutes += calculateReadingTimeMinutes(subpost.body || '')
    }
  }

  return Math.max(1, totalMinutes)
}

export function getOgImageSlug(postId: string, isParent: boolean): string {
  const finalSlug = isParent ? `${postId}/index` : postId
  return finalSlug.replaceAll('/', '-')
}
