import { describe, it, expect } from 'vitest'
import { GET } from './llms.txt'
import { SITE } from '@/consts'

describe('llms.txt endpoint', () => {
  it('returns text content containing site title and core pages', async () => {
    const mockContext = {
      site: new URL('https://romophic.com/'),
    } as any

    const response = await GET(mockContext)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
    
    const text = await response.text()
    expect(text).toContain(`# ${SITE.title}`)
    expect(text).toContain('Core Pages')
    expect(text).toContain('Latest Blog Posts')
  })
})
