import { describe, it, expect } from 'vitest'
import { findNodeAt, hitRadiusForZoom } from './geometry'
import type { D3GraphNode } from '@/types'

function makeNode(id: string, x?: number, y?: number): D3GraphNode {
  return { id, name: id, group: 'post', val: 5, x, y }
}

describe('findNodeAt (Test as Documentation)', () => {
  it('returns the node whose center is within the radius', () => {
    const nodes = [makeNode('a', 0, 0), makeNode('b', 100, 100)]

    expect(findNodeAt(nodes, 3, 4, 10)?.id).toBe('a') // dist 5 < 10
    expect(findNodeAt(nodes, 100, 100, 10)?.id).toBe('b')
  })

  it('returns null when every node is outside the radius', () => {
    const nodes = [makeNode('a', 0, 0)]

    expect(findNodeAt(nodes, 50, 50, 10)).toBeNull()
  })

  it('treats the radius boundary as exclusive', () => {
    const nodes = [makeNode('a', 0, 0)]

    expect(findNodeAt(nodes, 10, 0, 10)).toBeNull() // dist === radius
    expect(findNodeAt(nodes, 9.99, 0, 10)?.id).toBe('a')
  })

  it('returns the nearest node when several overlap the radius', () => {
    const nodes = [makeNode('far', 8, 0), makeNode('near', 2, 0)]

    expect(findNodeAt(nodes, 0, 0, 10)?.id).toBe('near')
  })

  it('ignores nodes without simulation coordinates', () => {
    const nodes = [makeNode('unplaced')]

    expect(findNodeAt(nodes, 0, 0, 10)).toBeNull()
  })
})

describe('hitRadiusForZoom', () => {
  it('converts a screen-space radius into world space for the current zoom', () => {
    expect(hitRadiusForZoom(12, 1)).toBe(12)
    expect(hitRadiusForZoom(12, 2)).toBe(6)
    expect(hitRadiusForZoom(12, 4)).toBe(3)
  })
})
