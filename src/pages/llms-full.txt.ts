import { getAllPostsAndSubposts } from '@/lib/data-utils'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPostsAndSubposts()

  let content = `# Full Content Export for ${site?.hostname}\n\n`
  content += `> This file contains the full text of all blog posts on this site, optimized for LLM ingestion.\n\n`

  for (const post of posts) {
    const postUrl = new URL(`/blog/${post.id}`, site).href
    content += `## ${post.data.title}\n`
    content += `- URL: ${postUrl}\n`
    content += `- Date: ${post.data.date.toISOString().split('T')[0]}\n`
    if (post.data.description) {
      content += `- Description: ${post.data.description}\n`
    }
    content += `\n`
    content += `${post.body}\n`
    content += `\n---\n\n`
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}

