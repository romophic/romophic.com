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

// Re-export everything from sub-modules to maintain compatibility
export * from './content/posts'
export * from './content/authors'
export * from './content/toc'
export * from './content/links'

/**
 * Aggregates all data needed for a single post page.
 */
export async function getPostPageData(
  post: CollectionEntry<'blog'>,
): Promise<PostPageData> {
  const currentPostId = post.id
  const isCurrentSubpost = isSubpost(currentPostId)

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
