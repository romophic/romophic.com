/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { GET } from './graph.json'

describe('graph.json endpoint', () => {
  it('returns valid JSON with nodes and links arrays', async () => {
    const response = await GET({} as any)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    
    const json = await response.json()
    expect(Array.isArray(json.nodes)).toBe(true)
    expect(Array.isArray(json.links)).toBe(true)
    
    if (json.nodes.length > 0) {
      expect(json.nodes[0]).toHaveProperty('id')
      expect(json.nodes[0]).toHaveProperty('name')
      expect(json.nodes[0]).toHaveProperty('group')
    }
  }, 60000)
})
