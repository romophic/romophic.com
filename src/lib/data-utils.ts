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
  getAllTags,
  getPostsByTag,
  getRecentPosts,
  getSortedTags,
  getParentId,
  isSubpost,
  getSubpostCount,
  getCombinedReadingTime,
  groupPostsByYear,
} from './content/posts'

export {
  parseAuthors,
  getAllAuthors,
  getPostsByAuthor,
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
  const lang = post.data.lang as 'ja' | 'en'
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
    getAdjacentPosts(currentPostId, lang),
    isCurrentSubpost ? getParentPost(currentPostId, lang) : null,
    hasSubposts(currentPostId, lang),
    !isCurrentSubpost ? getSubpostCount(currentPostId, lang) : 0,
    getPostReadingTime(currentPostId, lang),
    getTOCSections(currentPostId, lang),
    getBacklinks(currentPostId),
  ])

  const combinedReadingTime =
    hasChildPosts && !isCurrentSubpost
      ? await getCombinedReadingTime(currentPostId, lang)
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
