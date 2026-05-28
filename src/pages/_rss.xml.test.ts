/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { GET } from './rss.xml'
import { SITE } from '@/consts'

describe('rss.xml endpoint', () => {
  it('returns a valid RSS XML response', async () => {
    const mockContext = {
      site: new URL('https://romophic.com/'),
    } as any

    const response = await GET(mockContext)
    expect(response.status).toBe(200)
    
    const text = await response.text()
    expect(text).toContain('<?xml')
    expect(text).toContain('<rss')
    expect(text).toContain(`<title>${SITE.title}</title>`)
  })
})
