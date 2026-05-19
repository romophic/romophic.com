import path from 'node:path'
import { getAllPostsAndSubposts } from './posts'
import type { CollectionEntry } from 'astro:content'

import { render } from 'astro:content'

/**
 * Extract all resolved internal link target IDs from a post's frontmatter.
 */
export async function extractInternalLinks(
  post: CollectionEntry<'blog'>,
): Promise<string[]> {
  const { remarkPluginFrontmatter } = await render(post)
  const rawLinks = remarkPluginFrontmatter.rawInternalLinks || []
  const targets: string[] = []

  for (const url of rawLinks) {
    const targetId = resolveLinkToId(url, post.id)
    if (targetId) {
      targets.push(normalizeId(targetId))
    }
  }
  return targets
}

// Cache for the O(N) backlinks map
let _backlinksMap: Map<string, CollectionEntry<'blog'>[]> | null = null

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
    const targetIds = await extractInternalLinks(sourcePost)

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
