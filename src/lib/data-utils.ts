import type { PostPageData } from '@/types'
import type { CollectionEntry } from 'astro:content'
import {
  getAdjacentPosts,
  getParentPost,
  hasSubposts,
  isSubpost,
  getSubpostCount,
  getPostReadingTime,
  getCombinedReadingTime,
} from './content/posts'
import { parseAuthors } from './content/authors'
import { getTOCSections } from './content/toc'
import { getBacklinks } from './content/links'

export {
  getAllPosts,
  getAllProjects,
  getPostsByTag,
  getRecentPosts,
  getSortedTags,
  isSubpost,
  getParentId,
  getSubpostCount,
  getCombinedReadingTime,
  getPostReadingTime,
  calculateReadingTimeMinutes,
  formatReadingTime,
  getOgImageSlug,
  groupPostsByYear,
  normalizePostId,
} from './content/posts'

export { parseAuthors, getAllAuthors } from './content/authors'
export { extractInternalLinks } from './content/links'
export { getSubpostsData } from './content/subposts-data'

import type { ImageMetadata } from 'astro'

export function normalizeImage(image: unknown): ImageMetadata | undefined {
  if (!image) return undefined
  if (typeof image === 'string' && image.startsWith('__ASTRO_IMAGE_')) {
    return {
      src: image.replace(/^__ASTRO_IMAGE_/, ''),
      width: 1200,
      height: 630,
      format: 'jpg',
    }
  }
  return image as ImageMetadata
}

/**
 * Aggregates all data needed for a single post page.
 */
export async function getPostPageData(
  post: CollectionEntry<'blog'>,
): Promise<PostPageData> {
  const currentPostId = post.id
  const isCurrentSubpost = isSubpost(post)

  const [
    authors,
    navigation,
    parentPost,
    hasChildPosts,
    subpostCount,
    postReadingTime,
    tocSections,
    backlinks,
  ] = await Promise.all([
    parseAuthors(post.data.authors ?? []),
    getAdjacentPosts(currentPostId),
    isCurrentSubpost ? getParentPost(currentPostId) : null,
    hasSubposts(currentPostId),
    !isCurrentSubpost ? getSubpostCount(currentPostId) : 0,
    getPostReadingTime(currentPostId),
    getTOCSections(currentPostId),
    getBacklinks(currentPostId),
  ])

  const combinedReadingTime =
    hasChildPosts && !isCurrentSubpost
      ? await getCombinedReadingTime(currentPostId)
      : null

  return {
    authors,
    isCurrentSubpost,
    navigation,
    parentPost,
    hasChildPosts,
    subpostCount,
    postReadingTime,
    combinedReadingTime,
    tocSections,
    backlinks,
  }
}
