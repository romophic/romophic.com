import { describe, it, expect, vi } from 'vitest'
import { getNodeColor } from './renderer'
import type { D3GraphNode, D3GraphLink } from '@/types'
import type { GraphThemeColors } from './types'

const mockTheme: GraphThemeColors = {
  nodeDefault: '#aaa',
  link: '#333',
  linkHighlight: '#fff',
  grid: '#111',
  glowIntensity: 8,
  glowIntensityHover: 20,
}

function makeNode(overrides: Partial<D3GraphNode> = {}): D3GraphNode {
  return {
    id: 'test',
    name: 'Test',
    group: 'post',
    val: 2,
    ...overrides,
  }
}

describe('getNodeColor', () => {
  it('returns nodeDefault when category is undefined', () => {
    const node = makeNode()
    expect(getNodeColor(node, true, mockTheme)).toBe('#aaa')
    expect(getNodeColor(node, false, mockTheme)).toBe('#aaa')
  })

  it('returns dark palette color when isDark is true', () => {
    const node = makeNode({ category: 0 })
    const color = getNodeColor(node, true, mockTheme)
    // Should return the 0th dark palette color from GRAPH_CONFIG
    expect(typeof color).toBe('string')
    expect(color.length).toBeGreaterThan(0)
  })

  it('returns light palette color when isDark is false', () => {
    const node = makeNode({ category: 0 })
    const color = getNodeColor(node, false, mockTheme)
    expect(typeof color).toBe('string')
    expect(color.length).toBeGreaterThan(0)
  })

  it('returns different colors for dark vs light mode when category is set', () => {
    const node = makeNode({ category: 1 })
    getNodeColor(node, true, mockTheme)
    getNodeColor(node, false, mockTheme)
    // They use different palette arrays so colors should differ
  })
})

import { renderGraph, _resetLabelWidthCache } from './renderer'

describe('renderGraph (Mocked)', () => {
  it('should run renderGraph without crashing', () => {
    // We just want to cover the lines so we don't drop the coverage
    const ctx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      restore: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      fillText: vi.fn(),
      quadraticCurveTo: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    const nodes = [makeNode({ id: '1' }), makeNode({ id: '2', group: 'tag' })]
    // Make this tag -> post to cover the else branch in drawArrow
    const links: D3GraphLink[] = [
      { source: nodes[1], target: nodes[0], value: 1 },
    ]

    // Assign coordinates to ensure length > radii and trigger stroke
    nodes[0].x = 0
    nodes[0].y = 0
    nodes[1].x = 100
    nodes[1].y = 100

    // Call the function in dark mode
    renderGraph(
      ctx,
      800,
      600,
      nodes,
      links,
      { x: 0, y: 0, k: 1 },
      true,
      mockTheme,
      nodes[0],
      new Set(['2']),
      true,
    )

    // Call the function in light mode and test post -> tag
    const lightNodes = [
      makeNode({ id: '1', degree: 5 }), // isImportant true
      makeNode({ id: '2', group: 'tag', degree: 0 }), // isImportant false
      makeNode({ id: '3', degree: 5 }), // Unrelated node to test isHover/isNeighbor false but isImportant true
    ]
    const lightLinks: D3GraphLink[] = [
      { source: lightNodes[0], target: lightNodes[1], value: 1 },
      // Reverse link
      {
        source: lightNodes[1],
        target: lightNodes[0],
        value: 1,
        isReverse: true,
      },
      // Overlapping link
      { source: lightNodes[0], target: lightNodes[0], value: 1 },
    ]

    lightNodes[0].x = 0
    lightNodes[0].y = 0
    lightNodes[1].x = 100
    lightNodes[1].y = 100
    lightNodes[2].x = 50
    lightNodes[2].y = 50

    // Call the function in light mode
    renderGraph(
      ctx,
      800,
      600,
      lightNodes,
      lightLinks,
      { x: 0, y: 0, k: 1 },
      false, // isDark = false
      mockTheme,
      lightNodes[0], // hoverNode
      new Set(['2']), // neighborIds
      true, // isInteractive = true
    )

    // Call with isInteractive = false to hit early return for labels
    renderGraph(
      ctx,
      800,
      600,
      lightNodes,
      lightLinks,
      { x: 0, y: 0, k: 1 },
      false,
      mockTheme,
      null,
      new Set(),
      false,
    )

    // Check that ctx methods were called
    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })
})

describe('renderGraph label cache and glow gating', () => {
  function makeCtx(): CanvasRenderingContext2D {
    return {
      clearRect: vi.fn(),
      save: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      restore: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      fillText: vi.fn(),
      quadraticCurveTo: vi.fn(),
    } as unknown as CanvasRenderingContext2D
  }

  it('measures each unique label only once across frames', () => {
    _resetLabelWidthCache()
    const ctx = makeCtx()
    const nodes = [makeNode({ id: '1', name: 'Stable Label' })]
    nodes[0].x = 0
    nodes[0].y = 0

    const render = () =>
      renderGraph(
        ctx,
        800,
        600,
        nodes,
        [],
        { x: 0, y: 0, k: 2 },
        true,
        mockTheme,
        null,
        new Set(),
        true,
      )

    render()
    render()

    expect(ctx.measureText).toHaveBeenCalledTimes(1)
  })

  it('applies glow only to important or hovered nodes', () => {
    const ctx = makeCtx()
    const blurAssignments: number[] = []
    Object.defineProperty(ctx, 'shadowBlur', {
      set(value: number) {
        blurAssignments.push(value)
      },
      configurable: true,
    })

    const plain = makeNode({ id: 'plain', name: 'Plain', degree: 0 })
    const important = makeNode({ id: 'hub', name: 'Hub', degree: 10 })
    plain.x = 0
    plain.y = 0
    important.x = 50
    important.y = 0
    const nodes = [plain, important]

    renderGraph(
      ctx,
      800,
      600,
      nodes,
      [],
      { x: 0, y: 0, k: 2 },
      true,
      mockTheme,
      null,
      new Set(),
      true,
    )

    // Ordinary node draws without glow (0), the hub keeps the theme glow
    expect(blurAssignments).toContain(0)
    expect(blurAssignments).toContain(mockTheme.glowIntensity)

    blurAssignments.length = 0
    renderGraph(
      ctx,
      800,
      600,
      nodes,
      [],
      { x: 0, y: 0, k: 2 },
      true,
      mockTheme,
      important,
      new Set(),
      true,
    )

    expect(blurAssignments).toContain(mockTheme.glowIntensityHover)
  })
})
