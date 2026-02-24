import {
    getCombinedReadingTime,
    getParentId,
    getParentPost,
    getPostById,
    getPostReadingTime,
    getSubpostsForParent,
    isSubpost,
} from './posts'

type SubpostWithReadingTime = Awaited<
    ReturnType<typeof getSubpostsForParent>
>[number] & {
    readingTime: string
}

type SubpostsData = {
    activePost: Awaited<ReturnType<typeof getPostById>>
    isActivePost: boolean
    isCurrentSubpost: boolean
    activePostReadingTime: string | null
    activePostCombinedReadingTime: string | null
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
    const isCurrentSubpost = isSubpost(currentPostId)
    const rootParentId = isCurrentSubpost
        ? getParentId(currentPostId)
        : parentId

    const currentPost = !isCurrentSubpost
        ? await getPostById(currentPostId)
        : null
    const subposts = await getSubpostsForParent(rootParentId)
    const parentPost = isCurrentSubpost
        ? await getParentPost(currentPostId)
        : null

    const activePost = parentPost || currentPost
    const isActivePost = activePost?.id === currentPostId

    const activePostReadingTime = activePost
        ? await getPostReadingTime(activePost.id)
        : null
    const activePostCombinedReadingTime =
        activePost && subposts.length > 0
            ? await getCombinedReadingTime(activePost.id)
            : null

    const subpostsWithReadingTime = await Promise.all(
        subposts.map(async (subpost) => ({
            ...subpost,
            readingTime: await getPostReadingTime(subpost.id),
        })),
    )

    const currentSubpostDetails = isCurrentSubpost
        ? subpostsWithReadingTime.find(
            (subpost) => subpost.id === currentPostId,
        ) ?? null
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
