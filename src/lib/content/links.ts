import path from 'node:path'
import { getAllPostsAndSubposts } from './posts'
import type { CollectionEntry } from 'astro:content'

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

function isMatch(targetId: string | null, postId: string): boolean {
  if (!targetId) return false
  if (targetId === postId) return true

  const normalize = (id: string) =>
    id.endsWith('/index') ? id.replace(/\/index$/, '') : id
  return normalize(targetId) === normalize(postId)
}

export async function getBacklinks(
  postId: string,
): Promise<CollectionEntry<'blog'>[]> {
  const allPosts = await getAllPostsAndSubposts()
  const backlinks: CollectionEntry<'blog'>[] = []

  for (const post of allPosts) {
    if (post.id === postId) continue

    const regex = /\[.*?\]\((.*?)\)/g
    let match
    while ((match = regex.exec(post.body || '')) !== null) {
      const url = match[1]
      const targetId = resolveLinkToId(url, post.id)

      if (isMatch(targetId, postId)) {
        backlinks.push(post)
        break
      }
    }
  }
  return backlinks
}
