import { GRAPH_CONFIG } from '@/consts'
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

export function setupPhysics(
    nodes: D3GraphNode[],
    links: D3GraphLink[],
    width: number,
    height: number,
    onTick: () => void
): { simulation: Simulation<D3GraphNode, D3GraphLink>; setInteractive: (val: boolean) => void } {
    const { physics } = GRAPH_CONFIG

    const simulation = forceSimulation<D3GraphNode>(nodes)
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

    simulation.on('tick', onTick)

    // Custom rotational force
    const TARGET_STRENGTH = 0.001
    let currentStrength = TARGET_STRENGTH
    let targetStrength = TARGET_STRENGTH

    simulation.force('rotate', () => {
        // Smoothly interpolate strength toward target
        currentStrength += (targetStrength - currentStrength) * 0.02
        if (Math.abs(currentStrength) < 0.00001) return
        const cx = width / 2
        const cy = height / 2
        for (const node of nodes) {
            if (node.fx != null || node.fy != null) continue
            const dx = (node.x ?? 0) - cx
            const dy = (node.y ?? 0) - cy
            // Counter-clockwise: vx += dy, vy -= dx
            node.vx = (node.vx ?? 0) + dy * currentStrength
            node.vy = (node.vy ?? 0) - dx * currentStrength
        }
    })

    // Initial spin
    simulation.alphaTarget(0.02).restart()

    return {
        simulation,
        setInteractive: (isInteractive: boolean) => {
            targetStrength = isInteractive ? 0 : TARGET_STRENGTH
            if (isInteractive) {
                simulation.alphaTarget(0)
            } else {
                simulation.alphaTarget(0.02).restart()
            }
        }
    }
}
