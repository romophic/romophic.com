import type { APIRoute } from 'astro'

import { SITE } from '@/consts'

const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${SITE.href}/sitemap-index.xml
`.trim()

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
