import {
    getAllPostsAndSubposts,
    extractInternalLinks,
    normalizeId,
} from '@/lib/data-utils'
import type { APIRoute } from 'astro'

type GraphApiNode = {
    id: string
    name: string
    val: number
    group: 'post' | 'tag'
    color?: string
}

type GraphApiLink = {
    source: string
    target: string
    value: number
}

export const GET: APIRoute = async () => {
    const lang = 'en'
    const posts = await getAllPostsAndSubposts(lang)

    const nodes: GraphApiNode[] = []
    const links: GraphApiLink[] = []
    const tagSet = new Set<string>()
    const postIds = new Set(posts.map((p) => p.id))

    // Build a normalized ID -> actual ID map for O(1) lookup
    const normalizedIdMap = new Map<string, string>()
    for (const pid of postIds) {
        normalizedIdMap.set(normalizeId(pid), pid)
    }

    // 1. Add Post Nodes and Tag Links
    for (const post of posts) {
        nodes.push({
            id: post.id,
            name: post.data.title,
            val: 2, // Larger size for posts
            group: 'post',
            color: 'rgba(255, 255, 255, 0.8)', // Default color, will be overridden by CSS/Theme potentially
        })

        if (post.data.tags) {
            for (const tag of post.data.tags) {
                tagSet.add(tag)
                links.push({
                    source: post.id,
                    target: `tag-${tag}`,
                    value: 1,
                })
            }
        }
    }

    // 2. Add Tag Nodes
    for (const tag of tagSet) {
        nodes.push({
            id: `tag-${tag}`,
            name: `#${tag}`,
            val: 1, // Smaller size for tags
            group: 'tag',
            color: '#a855f7', // Purple color for tags
        })
    }

    // 3. Add Internal Links (Post to Post)
    for (const post of posts) {
        const targetIds = extractInternalLinks(post.body || '', post.id)

        for (const normTarget of targetIds) {
            const foundId = normalizedIdMap.get(normTarget)

            if (foundId && foundId !== post.id) {
                links.push({
                    source: post.id,
                    target: foundId,
                    value: 2, // Stronger connection between posts
                })
            }
        }
    }

    return new Response(JSON.stringify({ nodes, links }), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}
