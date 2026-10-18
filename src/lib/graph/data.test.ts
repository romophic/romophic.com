import { describe, it, expect } from 'vitest'
import { buildGraphData } from './data'
import { GRAPH_CONFIG } from '@/consts'

const center = { x: 100, y: 200 }
const fixedRandom = () => 0.5

describe('buildGraphData (Test as Documentation)', () => {
  it('dedupes nodes and ignores entries without ids', () => {
    const { nodes } = buildGraphData(
      {
        nodes: [
          { id: 'a', name: 'A', group: 'post' },
          { id: 'a', name: 'Duplicate', group: 'post' },
          { id: '', name: 'Empty', group: 'post' },
        ],
        links: [],
      },
      center,
      fixedRandom,
    )

    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ id: 'a', name: 'A', val: 5, degree: 0 })
  })

  it('drops links that reference unknown nodes and counts degree per link', () => {
    const { nodes, links } = buildGraphData(
      {
        nodes: [
          { id: 'a', name: 'A', group: 'post' },
          { id: 'b', name: 'B', group: 'post' },
        ],
        links: [
          { source: 'a', target: 'b', value: 2 },
          { source: 'a', target: 'ghost', value: 1 },
        ],
      },
      center,
      fixedRandom,
    )

    expect(links).toHaveLength(1)
    expect(nodes[0].degree).toBe(1)
    expect(nodes[1].degree).toBe(1)
  })

  it('marks the first of a mutual pair as bidirectional and the second as reverse', () => {
    const { links } = buildGraphData(
      {
        nodes: [
          { id: 'a', name: 'A', group: 'post' },
          { id: 'b', name: 'B', group: 'post' },
        ],
        links: [
          { source: 'a', target: 'b', value: 1 },
          { source: 'b', target: 'a', value: 1 },
        ],
      },
      center,
      fixedRandom,
    )

    expect(links).toHaveLength(2)
    expect(links[0].isBidirectional).toBe(true)
    expect(links[0].isReverse).toBeUndefined()
    expect(links[1].isReverse).toBe(true)
  })

  it('assigns tag categories cyclically and propagates them to connected posts', () => {
    const paletteSize = GRAPH_CONFIG.theme.palettes.dark.length
    const tagNodes = Array.from({ length: paletteSize + 1 }, (_, i) => ({
      id: `tag-${i}`,
      name: `#${i}`,
      group: 'tag' as const,
    }))

    const { nodes } = buildGraphData(
      {
        nodes: [{ id: 'post', name: 'Post', group: 'post' }, ...tagNodes],
        links: [{ source: 'post', target: `tag-${paletteSize}`, value: 1 }],
      },
      center,
      fixedRandom,
    )

    const tagFirst = nodes.find((n) => n.id === 'tag-0')!
    const tagWrapped = nodes.find((n) => n.id === `tag-${paletteSize}`)!
    const post = nodes.find((n) => n.id === 'post')!

    expect(tagFirst.category).toBe(0)
    expect(tagWrapped.category).toBe(0) // cycles back after the palette runs out
    expect(post.category).toBe(0) // inherited from its tag
  })

  it('scatters initial positions inside initialRadius around the center', () => {
    const { initialRadius } = GRAPH_CONFIG.physics
    const { nodes } = buildGraphData(
      { nodes: [{ id: 'a', name: 'A', group: 'post' }], links: [] },
      center,
      () => 0, // fully biased to one corner of the scatter box
    )

    expect(nodes[0].x).toBeCloseTo(center.x - initialRadius / 2)
    expect(nodes[0].y).toBeCloseTo(center.y - initialRadius / 2)
  })
})
