import path from 'node:path'
import { getAllPostsAndSubposts } from './posts'
import type { CollectionEntry } from 'astro:content'

// Global regex for capturing markdown link URLs: [label](url)
export const MARKDOWN_LINK_REGEX = /\[.*?\]\((.*?)\)/g

/**
 * Extract all resolved internal link target IDs from a post's body.
 */
export function extractInternalLinks(body: string, sourceId: string): string[] {
  MARKDOWN_LINK_REGEX.lastIndex = 0
  const targets: string[] = []
  let match
  while ((match = MARKDOWN_LINK_REGEX.exec(body)) !== null) {
    const targetId = resolveLinkToId(match[1], sourceId)
    if (targetId) {
      targets.push(normalizeId(targetId))
    }
  }
  return targets
}

// Cache for the O(N) backlinks map
let _backlinksMap: Map<string, CollectionEntry<'blog'>[]> | null = null

/**
 * Reset the backlinks cache. Useful for testing.
 */
export function resetBacklinksCache() {
  _backlinksMap = null
}

export function resolveLinkToId(url: string, sourceId: string): string | null {
  const cleanUrl = url.split('#')[0].split('?')[0]

  if (
    cleanUrl.startsWith('http') ||
    cleanUrl.startsWith('//') ||
    cleanUrl.startsWith('mailto:')
  )
    return null

  if (cleanUrl.startsWith('/blog/')) {
    return cleanUrl.replace('/blog/', '').replace(/\/$/, '')
  }

  if (
    cleanUrl.startsWith('./') ||
    cleanUrl.startsWith('../') ||
    !cleanUrl.startsWith('/')
  ) {
    const sourceDir = path.posix.dirname(sourceId)
    const resolved = path.posix.join(sourceDir, cleanUrl)
    return resolved
  }

  return null
}

export function normalizeId(id: string): string {
  return id.endsWith('/index') ? id.replace(/\/index$/, '') : id
}

/**
 * Builds a map of TargetID -> SourcePosts[] efficiently (O(N)).
 * Iterates through all posts once, extracts links, and populates the map.
 */
async function getBacklinksMap(): Promise<
  Map<string, CollectionEntry<'blog'>[]>
> {
  if (_backlinksMap) return _backlinksMap

  _backlinksMap = new Map()
  const allPosts = await getAllPostsAndSubposts()

  for (const sourcePost of allPosts) {
    const targetIds = extractInternalLinks(sourcePost.body || '', sourcePost.id)

    for (const targetId of targetIds) {
      if (!_backlinksMap.has(targetId)) {
        _backlinksMap.set(targetId, [])
      }
      const list = _backlinksMap.get(targetId)!

      // Avoid adding the same source post multiple times for the same target
      if (!list.some((p) => p.id === sourcePost.id)) {
        list.push(sourcePost)
      }
    }
  }

  return _backlinksMap
}

export async function getBacklinks(
  postId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const map = await getBacklinksMap()
  const normalizedId = normalizeId(postId)

  const backlinks = map.get(normalizedId) || []

  // Filter out self-links
  return backlinks.filter((post) => post.id !== postId)
}
