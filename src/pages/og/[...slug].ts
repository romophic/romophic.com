import { getCollection } from 'astro:content'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { SITE } from '@/consts'

export async function getStaticPaths() {
    const posts = await getCollection('blog')
    return posts.map((post) => ({
        params: { slug: post.id },
        props: { post },
    }))
}

export const GET = async ({ props }: { props: { post: any } }) => {
    const { post } = props

    // Load a font (Inter Bold)
    const fontData = await fetch(
        'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff',
    ).then((res) => res.arrayBuffer())

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
                                        children: post.data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                    }
                                }
                            ]
                        }
                    }
                ],
            },
        } as any,
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

    return new Response(pngBuffer as any, {
        headers: {
            'Content-Type': 'image/png',
        },
    })
}
