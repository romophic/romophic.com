import {
  calculateReadingTimeMinutes,
  getCombinedReadingTime,
  getParentPost,
  getPostById,
  getSubpostsForParent,
  isSubpost,
  getParentId,
} from './posts'

type SubpostWithReadingTime = Awaited<
  ReturnType<typeof getSubpostsForParent>
>[number] & {
  readingTime: number
}

type SubpostsData = {
  activePost: Awaited<ReturnType<typeof getPostById>>
  isActivePost: boolean
  isCurrentSubpost: boolean
  activePostReadingTime: number | null
  activePostCombinedReadingTime: number | null
  subpostsWithReadingTime: SubpostWithReadingTime[]
  currentSubpostDetails: SubpostWithReadingTime | null
}

/**
 * Shared data fetching logic for SubpostsSidebar and SubpostsHeader.
 * Extracts the common frontmatter script that was duplicated across both components.
 */
export async function getSubpostsData(
  parentId: string,
  currentPostId: string,
): Promise<SubpostsData> {
  const post = await getPostById(currentPostId)
  if (!post) {
    throw new Error(`Post not found: ${currentPostId}`)
  }

  const isCurrentSubpost = isSubpost(post)
  const inferredParentId = getParentId(post)
  const rootParentId =
    isCurrentSubpost && inferredParentId ? inferredParentId : parentId

  const currentPost = !isCurrentSubpost ? post : null
  const subposts = await getSubpostsForParent(rootParentId)
  const parentPost = isCurrentSubpost
    ? await getParentPost(currentPostId)
    : null

  const activePost = parentPost || currentPost
  const isActivePost = activePost?.id === currentPostId

  const activePostReadingTime = activePost
    ? calculateReadingTimeMinutes(activePost.body || '')
    : null
  const activePostCombinedReadingTime =
    activePost && subposts.length > 0
      ? await getCombinedReadingTime(activePost.id)
      : null

  const subpostsWithReadingTime = subposts.map((subpost) => ({
    ...subpost,
    readingTime: calculateReadingTimeMinutes(subpost.body || ''),
  }))

  const currentSubpostDetails = isCurrentSubpost
    ? (subpostsWithReadingTime.find(
        (subpost) => subpost.id === currentPostId,
      ) ?? null)
    : null

  return {
    activePost,
    isActivePost,
    isCurrentSubpost,
    activePostReadingTime,
    activePostCombinedReadingTime,
    subpostsWithReadingTime,
    currentSubpostDetails,
  }
}
