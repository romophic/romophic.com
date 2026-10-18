import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphLink, D3GraphNode } from '@/types'

export interface RawGraphNode {
  id: string
  name: string
  group: 'post' | 'tag'
  color?: string
}

export interface RawGraphLink {
  source: string
  target: string
  value: number
}

export interface RawGraphData {
  nodes: RawGraphNode[]
  links: RawGraphLink[]
}

export interface GraphData {
  nodes: D3GraphNode[]
  links: D3GraphLink[]
}

/**
 * Normalizes raw /graph.json payloads into simulation-ready data:
 * dedupe, degree counting, bidirectional detection, tag categories, scatter.
 * Pure: inject `random` to make initial positions deterministic in tests.
 */
export function buildGraphData(
  raw: RawGraphData,
  center: { x: number; y: number },
  random: () => number = Math.random,
): GraphData {
  const seenIds = new Set<string>()
  const nodes: D3GraphNode[] = []

  raw.nodes.forEach((n) => {
    if (!n.id || seenIds.has(n.id)) return
    seenIds.add(n.id)
    nodes.push({ ...n, val: 5, degree: 0 })
  })

  const nodeMap = new Map<string, D3GraphNode>(nodes.map((n) => [n.id, n]))
  const links: D3GraphLink[] = []
  const linkMap = new Map<string, D3GraphLink>()

  raw.links.forEach((l) => {
    if (!nodeMap.has(l.source) || !nodeMap.has(l.target)) return
    const s = nodeMap.get(l.source)!
    const t = nodeMap.get(l.target)!

    const reverseLink = linkMap.get(`${l.target}->${l.source}`)
    if (reverseLink) {
      reverseLink.isBidirectional = true
      links.push({ ...l, source: s, target: t, isReverse: true })
    } else {
      const newLink: D3GraphLink = {
        ...l,
        source: s,
        target: t,
        isBidirectional: false,
      }
      linkMap.set(`${l.source}->${l.target}`, newLink)
      links.push(newLink)
    }

    s.degree = (s.degree || 0) + 1
    t.degree = (t.degree || 0) + 1
  })

  const paletteSize = GRAPH_CONFIG.theme.palettes.dark.length
  let categoryIdx = 0
  const tagToCategory = new Map<string, number>()

  nodes.forEach((n) => {
    if (n.group === 'tag') {
      const category = categoryIdx % paletteSize
      tagToCategory.set(n.id, category)
      n.category = category
      categoryIdx++
    }
  })

  const nodeToTag = new Map<string, string>()
  links.forEach((l) => {
    const sId = typeof l.source === 'object' ? l.source.id : String(l.source)
    const tId = typeof l.target === 'object' ? l.target.id : String(l.target)
    if (nodeMap.get(tId)?.group === 'tag' && !nodeToTag.has(sId)) {
      nodeToTag.set(sId, tId)
    } else if (nodeMap.get(sId)?.group === 'tag' && !nodeToTag.has(tId)) {
      nodeToTag.set(tId, sId)
    }
  })

  nodes.forEach((n) => {
    if (n.group === 'post') {
      const tagId = nodeToTag.get(n.id)
      if (tagId) n.category = tagToCategory.get(tagId)
    }
  })

  const { initialRadius } = GRAPH_CONFIG.physics
  nodes.forEach((n) => {
    n.x = center.x + (random() - 0.5) * initialRadius
    n.y = center.y + (random() - 0.5) * initialRadius
  })

  return { nodes, links }
}
