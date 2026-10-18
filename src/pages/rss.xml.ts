import { SITE } from '@/consts'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getAllPosts } from '@/lib/data-utils'
import {
  renderPostContentHtml,
  sanitizeFeedHtml,
} from '@/lib/content/feed-html'

export async function GET(context: APIContext) {
  try {
    const posts = await getAllPosts()
    const site = context.site ?? new URL(SITE.href)

    const items = await Promise.all(
      posts.map(async (post) => {
        let content: string | null = null
        try {
          content = sanitizeFeedHtml(await renderPostContentHtml(post), site)
        } catch (error) {
          console.warn(`RSS: skipped full content for ${post.id}`, error)
        }

        const customData: string[] = []
        if (post.data.updatedDate) {
          customData.push(
            `<atom:updated>${post.data.updatedDate.toISOString()}</atom:updated>`,
          )
        }

        return {
          title: post.data.title,
          description: post.data.description,
          pubDate: post.data.date,
          link: new URL(`/blog/${post.id}/`, site).href,
          ...(content && { content }),
          ...(customData.length > 0 && { customData: customData.join('') }),
        }
      }),
    )

    return rss({
      title: SITE.title,
      description: SITE.description,
      site,
      xmlns: {
        atom: 'http://www.w3.org/2005/Atom',
      },
      customData: `<language>${SITE.locale}</language>`,
      items,
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return new Response('Error generating RSS feed', { status: 500 })
  }
}
