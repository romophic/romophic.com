import type { D3GraphNode } from '@/types'

/** World-space hit radius so the on-screen target stays constant while zooming. */
export function hitRadiusForZoom(screenRadius: number, k: number): number {
  return screenRadius / k
}

/** Nearest node within `radius` world units of (x, y), or null. */
export function findNodeAt(
  nodes: D3GraphNode[],
  x: number,
  y: number,
  radius: number,
): D3GraphNode | null {
  let nearest: D3GraphNode | null = null
  let nearestDist = radius

  for (const node of nodes) {
    if (node.x === undefined || node.y === undefined) continue
    const dist = Math.hypot(node.x - x, node.y - y)
    if (dist < nearestDist) {
      nearest = node
      nearestDist = dist
    }
  }

  return nearest
}
