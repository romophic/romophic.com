import type { CollectionEntry } from 'astro:content'

const SCRIPT_TAG = /<script[\s\S]*?<\/script>/gi
const SPAN_TAG = /<span[\s>]|<\/span>/g

export function stripScripts(html: string): string {
  return html.replace(SCRIPT_TAG, '')
}

export function stripKatexHtml(html: string): string {
  const marker = '<span class="katex-html"'
  let result = ''
  let pos = 0

  for (;;) {
    const start = html.indexOf(marker, pos)
    if (start === -1) return result + html.slice(pos)

    const openEnd = html.indexOf('>', start)
    if (openEnd === -1) return result + html.slice(pos)

    let depth = 1
    let end = html.length
    SPAN_TAG.lastIndex = openEnd + 1
    let match = SPAN_TAG.exec(html)
    while (match) {
      if (match[0].startsWith('</')) {
        depth -= 1
        if (depth === 0) {
          end = SPAN_TAG.lastIndex
          break
        }
      } else {
        depth += 1
      }
      match = SPAN_TAG.exec(html)
    }

    result += html.slice(pos, start)
    pos = end
  }
}

export function absolutizeUrls(html: string, site: URL): string {
  const origin = site.origin
  return html
    .replace(/(\s(?:src|href))="\/(?!\/)/g, `$1="${origin}/`)
    .replace(/\ssrcset="([^"]*)"/g, (_match, value: string) => {
      const rewritten = value
        .split(',')
        .map((part) => part.trim())
        .map((part) => (part.startsWith('/') ? origin + part : part))
        .join(', ')
      return ` srcset="${rewritten}"`
    })
}

export function sanitizeFeedHtml(html: string, site: URL): string {
  return absolutizeUrls(stripKatexHtml(stripScripts(html)), site)
}

export async function renderPostContentHtml(
  post: CollectionEntry<'blog'>,
): Promise<string> {
  const [
    { render },
    { experimental_AstroContainer },
    { loadRenderers },
    { getContainerRenderer },
  ] = await Promise.all([
    import('astro:content'),
    import('astro/container'),
    import('astro:container'),
    import('@astrojs/mdx/container-renderer'),
  ])
  const { Content } = await render(post)
  const renderers = await loadRenderers([getContainerRenderer()])
  const container = await experimental_AstroContainer.create({ renderers })
  return container.renderToString(Content)
}
