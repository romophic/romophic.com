import { SITE } from '@/consts'
import { getAllPosts } from '@/lib/data-utils'
import { dateKey } from '@/lib/utils'
import type { APIRoute } from 'astro'

function getPostAnchor(postId: string): string {
  return `post-${postId.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`
}

function absolutizeMarkdownImages(markdown: string, baseUrl: URL): string {
  return markdown.replace(
    /!\[([^\]]*)\]\(([^)\s]+)((?:\s+"[^"]*")?)\)/g,
    (match, alt: string, src: string, title: string) => {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(src)) return match
      return `![${alt}](${new URL(src, baseUrl).href}${title})`
    },
  )
}

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPosts()

  const siteTitle = SITE.title
  const siteDescription = SITE.description

  let content = `# ${siteTitle} - Full Content Dump\n\n`
  content += `> ${siteDescription}\n\n`
  content += `> This file contains the full content of all blog posts on ${siteTitle}, generated for LLM ingestion.\n\n`

  content += `## Table of Contents\n\n`
  posts.forEach((post) => {
    content += `- [${post.data.title}](#${getPostAnchor(post.id)})\n`
  })
  content += '\n'

  for (const post of posts) {
    const postUrl = new URL(`/blog/${post.id}/`, site)
    content += `---`
    content += `\n\n`
    content += `<a id="${getPostAnchor(post.id)}"></a>\n`
    content += `# ${post.data.title}\n`
    content += `ID: ${post.id}\n`
    content += `Date: ${dateKey(post.data.date)}\n`
    content += `URL: ${postUrl}\n`
    if (post.data.description) {
      content += `Description: ${post.data.description}\n`
    }
    if (post.data.tags?.length) {
      content += `Tags: ${post.data.tags.join(', ')}\n`
    }
    content += `\n`

    const body = post.body || '(No content)'
    content += `${absolutizeMarkdownImages(body, postUrl)}\n\n`
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
