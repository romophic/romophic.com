import { getAllAuthors, getAllPosts, getAllProjects } from '@/lib/data-utils'
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ site }) => {
  const posts = await getAllPosts()
  const projects = await getAllProjects()
  const authors = await getAllAuthors()

  const siteTitle = 'romophic.com'
  const siteDescription =
    'A personal blog and portfolio by romophic, focusing on software engineering, competitive programming, and mathematics.'

  let content = `# ${siteTitle}\n\n`
  content += `> ${siteDescription}\n\n`

  content += `## Core Pages\n\n`
  content += `- [Home](${site})
`
  content += `- [Blog](${new URL('/blog', site)})
`
  content += `- [About](${new URL('/about', site)})
`
  content += `- [RSS Feed](${new URL('/rss.xml', site)})

`

  content += `## Latest Blog Posts\n\n`
  posts.slice(0, 20).forEach((post) => {
    content += `- [${post.data.title}](${new URL(`/blog/${post.id}`, site)}): ${post.data.description}\n`
  })
  if (posts.length > 20) {
    content += `- ...and ${posts.length - 20} more posts at [Blog Index](${new URL('/blog', site)})
`
  }
  content += '\n'

  if (projects.length > 0) {
    content += `## Projects\n\n`
    projects.forEach((project) => {
      content += `- [${project.data.name}](${project.data.link}): ${project.data.description}\n`
    })
    content += '\n'
  }

  if (authors.length > 0) {
    content += `## Authors\n\n`
    authors.forEach((author) => {
      content += `- [${author.data.name}](${new URL(`/authors/${author.id}`, site)})
`
    })
  }

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
