import { describe, it, expect } from 'vitest'
import { GET } from './robots.txt'
import { SITE } from '@/consts'

describe('robots.txt endpoint (Test as Documentation)', () => {
  it('returns valid robots.txt with user-agent allow rule and sitemap location', async () => {
    const response = await GET({} as unknown as Parameters<typeof GET>[0])
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe(
      'text/plain; charset=utf-8',
    )

    const text = await response.text()
    expect(text).toContain('User-agent: *')
    expect(text).toContain('Allow: /')
    expect(text).toContain(`Sitemap: ${SITE.href}/sitemap-index.xml`)
  })
})
