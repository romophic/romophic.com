import { SITE } from '@/consts'
import { Resvg } from '@resvg/resvg-js'
import { getOgImageSlug } from '@/lib/data-utils'
import { getCollection, type CollectionEntry } from 'astro:content'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import satori, { type SatoriNode } from 'satori'

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft)

  return [
    ...posts.map((post) => ({
      params: { slug: getOgImageSlug(post.id) },
      props: { post },
    })),
    { params: { slug: 'default' }, props: {} },
  ]
}

// Noto Sans JP Bold covers both Japanese and Latin glyphs, so this single
// bundled font is enough and the build never needs network access.
const FONT_PATH = path.join(
  process.cwd(),
  'public',
  'fonts',
  'NotoSansJP-Bold.otf',
)

let fontData: ArrayBuffer | null = null

async function getFont(): Promise<ArrayBuffer> {
  if (!fontData) {
    const file = await readFile(FONT_PATH)
    fontData = new Uint8Array(file).buffer as ArrayBuffer
  }
  return fontData
}

export const GET = async ({
  props,
}: {
  props: { post?: CollectionEntry<'blog'> }
}) => {
  const { post } = props
  const title = post?.data.title ?? SITE.description
  const footerText = post
    ? post.data.date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : SITE.href.replace(/^https?:\/\//, '')

  const font = await getFont()

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          // satori >= 0.4x (Taffy) defaults to content-box, which would add
          // the padding outside the 1200x630 canvas and clip the layout.
          boxSizing: 'border-box',
          backgroundColor: '#121212',
          color: '#ffffff',
          padding: '80px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: '1',
                width: '100%',
                boxSizing: 'border-box',
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
                      fontFamily: 'Noto Sans JP',
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
                      width: '100%',
                      boxSizing: 'border-box',
                      fontFamily: 'Noto Sans JP',
                    },
                    children: title,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: '24px',
                opacity: 0.8,
                maxWidth: '1000px',
                fontFamily: 'Noto Sans JP',
              },
              children: footerText,
            },
          },
        ],
      },
    } as unknown as SatoriNode,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  )

  const pngData = new Resvg(svg).render().asPng()

  return new Response(new Uint8Array(pngData), {
    headers: {
      'Content-Type': 'image/png',
    },
  })
}
