import { getCollection, type CollectionEntry } from 'astro:content'
import { render } from 'astro:content'

/**
 * Get all posts, normalizing IDs.
 * Removes /index suffixes for clean routing.
 */
export async function getNormalizedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const rawPosts = await getCollection('blog')
  return rawPosts.map((post) => {
    let newId = post.id
    newId = newId.replace(/\/index$/, '')
    return Object.assign({}, post, { id: newId })
  })
}

export async function getAllPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getNormalizedPosts()
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAllPostsAndSubposts(): Promise<
  CollectionEntry<'blog'>[]
> {
  const posts = await getNormalizedPosts()
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

export function isSubpost(post: CollectionEntry<'blog'>): boolean {
  return post.data.parent !== undefined || post.id.includes('/')
}

export function getParentId(post: CollectionEntry<'blog'>): string {
  if (post.data.parent) return post.data.parent.id.replace(/\/index$/, '')
  if (post.id.includes('/')) return post.id.split('/')[0];
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
    .filter((post) => !post.data.draft && getParentId(post) === parentId && post.id !== parentId)
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

  if (isSubpost(currentPost)) {
    const parentId = getParentId(currentPost)
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
  const post = await getPostById(subpostId)
  if (!post) return null
  const parentId = getParentId(post)
  if (!parentId) return null
  return await getPostById(parentId)
}

export async function getSubpostCount(parentId: string): Promise<number> {
  const subposts = await getSubpostsForParent(parentId)
  return subposts.length
}

export async function getPostReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return '0 min read'

  const { remarkPluginFrontmatter } = await render(post)
  return remarkPluginFrontmatter.minutesRead || '0 min read'
}

export async function getCombinedReadingTime(postId: string): Promise<string> {
  const post = await getPostById(postId)
  if (!post) return '0 min read'

  const { remarkPluginFrontmatter: parentFrontmatter } = await render(post)
  // remarkPluginFrontmatter.minutesRead typically looks like "3 min read"
  // We need to parse the integer from it
  let totalMinutes = parseInt(parentFrontmatter.minutesRead) || 0

  if (!isSubpost(post)) {
    const subposts = await getSubpostsForParent(postId)
    for (const subpost of subposts) {
      const { remarkPluginFrontmatter: subFrontmatter } = await render(subpost)
      totalMinutes += parseInt(subFrontmatter.minutesRead) || 0
    }
  }

  return `${Math.ceil(totalMinutes)} min read`
}
