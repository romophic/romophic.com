import { SITE } from '@/consts'
import { Resvg } from '@resvg/resvg-js'
import { getCollection, type CollectionEntry } from 'astro:content'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
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

const CACHE_DIR = path.join(
  process.cwd(),
  'node_modules',
  '.cache',
  'og-images',
)

async function getCachedImage(
  slug: string,
  hashKey: string,
): Promise<Buffer | null> {
  try {
    if (!existsSync(CACHE_DIR)) {
      await mkdir(CACHE_DIR, { recursive: true })
    }

    const hash = createHash('md5').update(hashKey).digest('hex')
    const safeSlug = slug.replace(/[^a-z0-9]/gi, '_')
    const filePath = path.join(CACHE_DIR, `${safeSlug}-${hash}.png`)

    if (existsSync(filePath)) {
      return await readFile(filePath)
    }
    return null
  } catch (e) {
    console.warn('Cache read error:', e)
    return null
  }
}

async function saveCachedImage(
  slug: string,
  hashKey: string,
  buffer: Uint8Array,
) {
  try {
    if (!existsSync(CACHE_DIR)) {
      await mkdir(CACHE_DIR, { recursive: true })
    }
    const hash = createHash('md5').update(hashKey).digest('hex')
    const safeSlug = slug.replace(/[^a-z0-9]/gi, '_')
    const filePath = path.join(CACHE_DIR, `${safeSlug}-${hash}.png`)
    await writeFile(filePath, buffer)
  } catch (e) {
    console.warn('Cache write error:', e)
  }
}

export const GET = async ({
  props,
}: {
  props: { post: CollectionEntry<'blog'> }
}) => {
  const { post } = props

  const hashKey = JSON.stringify({
    title: post.data.title,
    date: post.data.date.toISOString(),
    siteTitle: SITE.title,
    version: 'v1',
  })

  // Try cache
  const cachedBuffer = await getCachedImage(post.id, hashKey)
  if (cachedBuffer) {
    return new Response(new Uint8Array(cachedBuffer), {
      headers: {
        'Content-Type': 'image/png',
      },
    })
  }

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

  await saveCachedImage(post.id, hashKey, new Uint8Array(pngBuffer))

  return new Response(new Uint8Array(pngBuffer), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}
