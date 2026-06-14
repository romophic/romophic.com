import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphLink, D3GraphNode } from '@/types'
import { drag } from 'd3-drag'
import { select } from 'd3-selection'
import { zoom, zoomIdentity, type ZoomTransform } from 'd3-zoom'
import type { PhysicsController } from './physics'

export const EMPTY_SET: ReadonlySet<string> = new Set()

export function buildNeighborIds(
  nodeId: string,
  links: D3GraphLink[],
): ReadonlySet<string> {
  const ids = new Set<string>()
  for (const l of links) {
    const sId = typeof l.source === 'object' ? l.source.id : l.source
    const tId = typeof l.target === 'object' ? l.target.id : l.target
    if (sId === nodeId) ids.add(tId)
    else if (tId === nodeId) ids.add(sId)
  }
  return ids
}

export function setupInteraction(
  canvas: HTMLCanvasElement,
  nodes: D3GraphNode[],
  links: D3GraphLink[],
  physicsController: PhysicsController | null,
  width: number,
  height: number,
  onTransform: (t: ZoomTransform) => void,
  onHover: (
    hovered: D3GraphNode | null,
    neighbors: ReadonlySet<string>,
  ) => void,
  onClick: (node: D3GraphNode | null) => void,
  fullInteraction: boolean = true,
): { cleanup: () => void; getInitialTransform: () => ZoomTransform } {
  let currentTransform = zoomIdentity

  const initialScale = 2.0
  const initialTransform = zoomIdentity
    .translate(
      (width - width * initialScale) / 2,
      (height - height * initialScale) / 2,
    )
    .scale(initialScale)

  let hoverNode: D3GraphNode | null = null

  if (fullInteraction) {
    const zoomHandler = zoom<HTMLCanvasElement, unknown>()
      .scaleExtent(GRAPH_CONFIG.interaction.zoomExtent)
      .on('zoom', (event) => {
        currentTransform = event.transform
        onTransform(currentTransform)
      })

    select(canvas)
      .call(zoomHandler)
      .call(zoomHandler.transform, initialTransform)

    const dragHandler = drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const x = currentTransform.invertX(event.x)
        const y = currentTransform.invertY(event.y)
        return nodes.find((n) => Math.hypot(n.x! - x, n.y! - y) < 20)
      })
      .on('start', (event) => {
        if (!event.active && physicsController) {
          physicsController.controlSimulation(GRAPH_CONFIG.physics.alphaTarget, true)
        }
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
        physicsController?.updateNode(event.subject.id, event.subject.fx, event.subject.fy)
      })
      .on('drag', (event) => {
        event.subject.fx = currentTransform.invertX(event.sourceEvent.offsetX)
        event.subject.fy = currentTransform.invertY(event.sourceEvent.offsetY)
        physicsController?.updateNode(event.subject.id, event.subject.fx, event.subject.fy)
      })
      .on('end', (event) => {
        if (!event.active && physicsController) {
          physicsController.controlSimulation(0)
        }
        event.subject.fx = null
        event.subject.fy = null
        physicsController?.updateNode(event.subject.id, null, null)
      })

    select(canvas).call(dragHandler)
  } else {
    // If not full interaction, just set initial transform manually
    currentTransform = initialTransform
    onTransform(currentTransform)
  }

  const handleMouseMove = (e: MouseEvent) => {
    const x = currentTransform.invertX(e.offsetX)
    const y = currentTransform.invertY(e.offsetY)

    const hovered =
      nodes.find((node) => {
        if (node.x === undefined || node.y === undefined) return false
        return (
          Math.hypot(node.x - x, node.y - y) <
          GRAPH_CONFIG.interaction.hitRadius
        )
      }) || null

    if (hovered?.id !== hoverNode?.id) {
      hoverNode = hovered
      const neighborIds = hovered
        ? buildNeighborIds(hovered.id, links)
        : EMPTY_SET
      onHover(hovered, neighborIds)
    }

    canvas.style.cursor = hovered ? 'pointer' : 'default'
  }

  const handleClickEvent = () => {
    if (hoverNode) onClick(hoverNode)
  }

  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('click', handleClickEvent)

  return {
    getInitialTransform: () => initialTransform,
    cleanup: () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClickEvent)
      select(canvas).on('.zoom', null).on('.drag', null)
    },
  }
}
