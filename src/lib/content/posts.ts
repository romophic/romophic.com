import { getCollection, type CollectionEntry } from 'astro:content'
import readingTime from 'reading-time'

/**
 * Get all posts, normalizing IDs for bilingual routing.
 * This is fast enough to do on-the-fly without an explicit module cache,
 * removing statefulness and fixing HMR inconsistencies.
 */
export async function getNormalizedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const rawPosts = await getCollection('blog')
  return rawPosts.map((post) => {
    let newId = post.id
    if (post.data.lang === 'en') {
      newId = newId.replace(/\.?en$/, '')
    }
    newId = newId.replace(/\/index$/, '')
    return Object.assign({}, post, { id: newId })
  })
}

export async function getAllPosts(
  lang: 'ja' | 'en' = 'ja',
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getNormalizedPosts()
  return posts
    .filter(
      (post) =>
        !post.data.draft && !isSubpost(post.id) && post.data.lang === lang,
    )
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllPostsAndSubposts(
  lang: 'ja' | 'en' = 'ja',
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getNormalizedPosts()
  return posts
    .filter((post) => !post.data.draft && post.data.lang === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
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
  lang: 'ja' | 'en' = 'ja'
): Promise<CollectionEntry<'blog'> | null> {
  const posts = await getNormalizedPosts()
  return posts.find((p) => p.id === postId && p.data.lang === lang) ?? null
}

export async function getSubpostsForParent(
  parentId: string,
  lang: 'ja' | 'en' = 'ja'
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getNormalizedPosts()
  return posts
    .filter(
      (post) =>
        !post.data.draft &&
        isSubpost(post.id) &&
        getParentId(post.id) === parentId &&
        post.data.lang === lang
    )
    .sort((a, b) => {
      const orderA = a.data.order ?? 0
      const orderB = b.data.order ?? 0
      const orderDiff = orderA - orderB
      if (orderDiff !== 0) return orderDiff

      return a.data.date.valueOf() - b.data.date.valueOf()
    })
}

export async function getAdjacentPosts(
  currentId: string,
  lang: 'ja' | 'en' = 'ja'
): Promise<{
  newer: CollectionEntry<'blog'> | null
  older: CollectionEntry<'blog'> | null
  parent: CollectionEntry<'blog'> | null
}> {
  const currentPost = await getPostById(currentId, lang)
  if (!currentPost) return { newer: null, older: null, parent: null }
  const currentLang = currentPost.data.lang as 'ja' | 'en'

  if (isSubpost(currentId)) {
    const parentId = getParentId(currentId)
    const parent = (await getPostById(parentId, lang)) || null

    const subposts = await getSubpostsForParent(parentId, lang)

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
        ; (acc[year] ??= []).push(post)
      return acc
    },
    {},
  )
}

export async function hasSubposts(postId: string, lang: 'ja' | 'en' = 'ja'): Promise<boolean> {
  const subposts = await getSubpostsForParent(postId, lang)
  return subposts.length > 0
}

export async function getParentPost(
  subpostId: string,
  lang: 'ja' | 'en' = 'ja'
): Promise<CollectionEntry<'blog'> | null> {
  if (!isSubpost(subpostId)) {
    return null
  }
  const parentId = getParentId(subpostId)
  return await getPostById(parentId, lang)
}

export async function getSubpostCount(parentId: string, lang: 'ja' | 'en' = 'ja'): Promise<number> {
  const subposts = await getSubpostsForParent(parentId, lang)
  return subposts.length
}

export async function getPostReadingTime(postId: string, lang: 'ja' | 'en' = 'ja'): Promise<string> {
  const post = await getPostById(postId, lang)
  if (!post) return '0 min read'

  return readingTime(post.body || '').text
}

export async function getCombinedReadingTime(postId: string, lang: 'ja' | 'en' = 'ja'): Promise<string> {
  const post = await getPostById(postId, lang)
  if (!post) return '0 min read'

  let totalMinutes = readingTime(post.body || '').minutes

  if (!isSubpost(postId)) {
    const subposts = await getSubpostsForParent(postId, lang)
    for (const subpost of subposts) {
      totalMinutes += readingTime(subpost.body || '').minutes
    }
  }

  return `${Math.ceil(totalMinutes)} min read`
}
