import { getAllPostsAndSubposts } from '@/lib/data-utils'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPostsAndSubposts()

  const siteTitle = 'romophic.com'
  const siteDescription =
    'A personal blog and portfolio by romophic, focusing on software engineering, competitive programming, and mathematics.'

  let content = `# ${siteTitle} - Full Content Dump\n\n`
  content += `> ${siteDescription}\n\n`
  content += `> This file contains the full content of all blog posts on ${siteTitle}, generated for LLM ingestion.\n\n`

  content += `## Table of Contents\n\n`
  posts.forEach((post) => {
    content += `- [${post.data.title}](#${post.id.replace(/\//g, '-')})\n`
  })
  content += '\n'

  for (const post of posts) {
    content += `---`
    content += `\n\n`
    content += `# ${post.data.title}\n`
    content += `ID: ${post.id}\n` // Anchor for TOC
    content += `Date: ${post.data.date.toISOString().split('T')[0]}\n`
    content += `URL: ${new URL(`/blog/${post.id}`, site)}\n`
    if (post.data.description) {
      content += `Description: ${post.data.description}\n`
    }
    if (post.data.tags) {
      content += `Tags: ${post.data.tags.join(', ')}\n`
    }
    content += `\n`

    // Add content body
    // Ensure we handle potential undefined body, though data-utils suggests it exists
    const body = post.body || '(No content)'
    content += `${body}\n\n`
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
