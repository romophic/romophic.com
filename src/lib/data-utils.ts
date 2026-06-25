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
  getAllPostsAndSubposts,
  getAllProjects,
  getPostsByTag,
  getRecentPosts,
  getSortedTags,
  isSubpost,
  getParentId,
  getSubpostCount,
  getCombinedReadingTime,
  getOgImageSlug,
  groupPostsByYear,
} from './content/posts'

export {
  parseAuthors,
  getAllAuthors,
} from './content/authors'
export { normalizeId, extractInternalLinks } from './content/links'
export { getSubpostsData } from './content/subposts-data'

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
