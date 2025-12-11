import { SITE } from '@/consts'
import { Resvg } from '@resvg/resvg-js'
import { getCollection, type CollectionEntry } from 'astro:content'
import satori from 'satori'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  const postIds = new Set(posts.map((p) => p.id))
  const parentIds = new Set<string>()

  for (const id of postIds) {
    const parts = id.split('/')
    parts.pop()
    while (parts.length > 0) {
      parentIds.add(parts.join('/'))
      parts.pop()
    }
  }

  return posts.map((post) => {
    const slug = post.id
    const finalSlug = parentIds.has(slug) ? `${slug}/index` : slug

    return {
      params: { slug: finalSlug.replaceAll('/', '-') },
      props: { post },
    }
  })
}

// In-memory cache for the font data.
let fontDataCache: ArrayBuffer | null = null

async function getFontData() {
  if (fontDataCache) return fontDataCache
  try {
    const response = await fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff',
    )
    if (!response.ok) throw new Error('Failed to fetch font')
    fontDataCache = await response.arrayBuffer()
    return fontDataCache
  } catch (e) {
    console.error('Font fetch error:', e)
    throw e
  }
}

export const GET = async ({
  props,
}: {
  props: { post: CollectionEntry<'blog'> }
}) => {
  const { post } = props
  const fontData = await getFontData()

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          height: '100%',
          width: '100%',
          backgroundColor: '#121212', // Dark theme background
          color: '#ffffff',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: '24px',
                opacity: 0.8,
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              },
              children: SITE.title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: '64px',
                fontWeight: 'bold',
                lineHeight: 1.2,
              },
              children: post.data.title,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                marginTop: 'auto',
                alignItems: 'center',
                gap: '20px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '24px', opacity: 0.8 },
                    children: post.data.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  )

  const resvg = new Resvg(svg)
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}
