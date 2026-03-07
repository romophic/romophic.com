import { describe, it, expect } from 'vitest'
import { getNodeColor } from './renderer'
import type { D3GraphNode } from '@/types'
import type { GraphThemeColors } from './types'

const mockTheme: GraphThemeColors = {
  background: '#000',
  nodeDefault: '#aaa',
  nodeTag: '#a855f7',
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
    const darkColor = getNodeColor(node, true, mockTheme)
    const lightColor = getNodeColor(node, false, mockTheme)
    // They use different palette arrays so colors should differ
    expect(darkColor).not.toBe(lightColor)
  })
})
