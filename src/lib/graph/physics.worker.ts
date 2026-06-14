import { GRAPH_CONFIG } from '../../consts'
import type { D3GraphLink, D3GraphNode } from '@/types'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
} from 'd3-force'

let simulation: Simulation<D3GraphNode, D3GraphLink> | null = null
let nodes: D3GraphNode[] = []

// Custom rotational force params
const TARGET_STRENGTH = 0.001
let currentStrength = TARGET_STRENGTH
let targetStrength = TARGET_STRENGTH
let width = 0
let height = 0

self.onmessage = (event: MessageEvent) => {
  const { type, payload } = event.data

  if (type === 'INIT') {
    nodes = payload.nodes
    width = payload.width
    height = payload.height
    const links = payload.links
    const { physics } = GRAPH_CONFIG

    simulation = forceSimulation<D3GraphNode>(nodes)
      .force(
        'link',
        forceLink<D3GraphNode, D3GraphLink>(links)
          .id((d) => d.id)
          .distance(physics.linkDistance),
      )
      .force('charge', forceManyBody().strength(physics.chargeStrength))
      .force('center', forceCenter(width / 2, height / 2))
      .force('x', forceX(width / 2).strength(physics.centerStrength))
      .force('y', forceY(height / 2).strength(physics.centerStrength))
      .force('collide', forceCollide().radius(physics.collideRadius))

    simulation.on('tick', () => {
      const tickData = nodes.map((n) => ({
        id: n.id,
        x: n.x,
        y: n.y,
        vx: n.vx,
        vy: n.vy,
      }))
      self.postMessage({ type: 'TICK', payload: tickData })
    })

    simulation.force('rotate', () => {
      currentStrength += (targetStrength - currentStrength) * 0.02
      if (Math.abs(currentStrength) < 0.00001) return
      const cx = width / 2
      const cy = height / 2
      for (const node of nodes) {
        if (node.fx != null || node.fy != null) continue
        const dx = (node.x ?? 0) - cx
        const dy = (node.y ?? 0) - cy
        node.vx = (node.vx ?? 0) + dy * currentStrength
        node.vy = (node.vy ?? 0) - dx * currentStrength
      }
    })

    simulation.alphaTarget(0.02).restart()
  } else if (type === 'SET_INTERACTIVE') {
    const isInteractive = payload.isInteractive
    targetStrength = isInteractive ? 0 : TARGET_STRENGTH
    if (simulation) {
      if (isInteractive) {
        simulation.alphaTarget(0)
      } else {
        simulation.alphaTarget(0.02).restart()
      }
    }
  } else if (type === 'UPDATE_NODE') {
    const { id, fx, fy } = payload
    const node = nodes.find((n) => n.id === id)
    if (node) {
      node.fx = fx
      node.fy = fy
    }
  } else if (type === 'SIMULATION_CONTROL') {
    if (simulation) {
      if (payload.alphaTarget !== undefined) {
        simulation.alphaTarget(payload.alphaTarget)
      }
      if (payload.restart) {
        simulation.restart()
      }
    }
  } else if (type === 'DESTROY') {
    if (simulation) {
      simulation.stop()
      simulation.on('tick', null)
    }
    self.close()
  }
}
