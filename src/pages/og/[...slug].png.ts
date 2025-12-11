import { getCollection, type CollectionEntry } from 'astro:content'
import { Resvg } from '@resvg/resvg-js'
import satori from 'satori'
import { SITE } from '@/consts'

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

export const GET = async ({ props }: { props: { post: CollectionEntry<'blog'> } }) => {
	const { post } = props

	// Load a font (Inter Bold)
	if (!fontDataCache) {
		fontDataCache = await fetch(
			'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.woff',
		).then((res) => res.arrayBuffer())
	}

	/* eslint-disable @typescript-eslint/no-explicit-any */
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
		} as any,
		{
			width: 1200,
			height: 630,
			fonts: [
				{
					name: 'Inter',
					data: fontDataCache!,
					weight: 700,
					style: 'normal',
				},
			],
		},
	)
	/* eslint-enable @typescript-eslint/no-explicit-any */

    const resvg = new Resvg(svg)
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    return new Response(new Uint8Array(pngBuffer), {
        headers: {
            'Content-Type': 'image/png',
        },
    })
}
