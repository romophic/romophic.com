import { SITE } from '@/consts'
import { Resvg } from '@resvg/resvg-js'
import { getOgImageSlug } from '@/lib/data-utils'
import { getCollection, type CollectionEntry } from 'astro:content'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import satori, { type SatoriNode } from 'satori'

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft)
  const parentIds = new Set(
    posts.map((p) => p.data.parent?.id).filter(Boolean) as string[],
  )

  return posts.map((post) => {
    const slug = getOgImageSlug(post.id, parentIds.has(post.id))

    return {
      params: { slug },
      props: { post },
    }
  })
}

// In-memory cache for the font data.
let fontsCache: { inter: ArrayBuffer; notoSansJP: ArrayBuffer | null } | null =
  null

const FONT_CACHE_DIR = path.join(
  process.cwd(),
  'node_modules',
  '.cache',
  'og-fonts',
)

async function getFonts() {
  if (fontsCache) return fontsCache

  async function fetchAndCache(
    cacheName: string,
    url: string,
  ): Promise<ArrayBuffer | null> {
    const cachePath = path.join(FONT_CACHE_DIR, cacheName)
    try {
      if (existsSync(cachePath)) {
        const cached = await readFile(cachePath)
        return new Uint8Array(cached).buffer as ArrayBuffer
      }
      const res = await fetch(url)
      if (!res.ok) {
        console.warn(`Failed to fetch font ${cacheName}: ${res.statusText}`)
        return null
      }
      const buf = await res.arrayBuffer()
      await mkdir(FONT_CACHE_DIR, { recursive: true })
      await writeFile(cachePath, new Uint8Array(buf))
      return buf
    } catch (e) {
      console.warn(`Failed to load font ${cacheName}:`, e)
      return null
    }
  }

  const inter = await fetchAndCache(
    'Inter-Bold.ttf',
    'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
  )
  const notoSansJP = await fetchAndCache(
    'NotoSansJP-Bold.otf',
    'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/JP/NotoSansJP-Bold.otf',
  )

  if (!inter) throw new Error('Failed to load Inter font for OG images')

  fontsCache = { inter, notoSansJP }
  return fontsCache
}

const CACHE_DIR = path.join(
  process.cwd(),
  'node_modules',
  '.cache',
  'og-images',
)

async function getCacheFilePath(
  slug: string,
  hashKey: string,
): Promise<string> {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true })
  }
  const hash = createHash('md5').update(hashKey).digest('hex')
  const safeSlug = slug.replace(/[^a-z0-9]/gi, '_')
  return path.join(CACHE_DIR, `${safeSlug}-${hash}.png`)
}

async function getCachedImage(
  slug: string,
  hashKey: string,
): Promise<Buffer | null> {
  try {
    const filePath = await getCacheFilePath(slug, hashKey)
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
    const filePath = await getCacheFilePath(slug, hashKey)
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
    version: SITE.version ?? '1', // Cache buster: update via SITE config
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

  const fonts = await getFonts()
  if (!fonts) throw new Error('Failed to load fonts')

  const fontConfig: {
    name: string
    data: ArrayBuffer
    weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
    style: 'normal' | 'italic'
  }[] = [
    {
      name: 'Inter',
      data: fonts.inter,
      weight: 700,
      style: 'normal',
    },
  ]

  if (fonts.notoSansJP) {
    fontConfig.push({
      name: 'Noto Sans JP',
      data: fonts.notoSansJP,
      weight: 700,
      style: 'normal',
    })
  }

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          height: '100%',
          width: '100%',
          backgroundColor: '#121212',
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
                fontFamily: 'Inter',
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
                fontFamily: 'Noto Sans JP, Inter',
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
                fontFamily: 'Inter',
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
    } as unknown as SatoriNode,
    {
      width: 1200,
      height: 630,
      fonts: fontConfig,
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
