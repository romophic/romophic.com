import React, { useCallback, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphNode, D3GraphLink } from '@/types'
import { renderGraph } from './graph/graph-renderer'
import { useGraphData, useThemeDetection } from './graph/use-graph-data'

const EMPTY_SET: ReadonlySet<string> = new Set()

/** Build a Set of node IDs adjacent to the given node. */
function buildNeighborIds(
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

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { data, isVisible } = useGraphData()
  const isDark = useThemeDetection()

  const hoverNodeRef = useRef<D3GraphNode | null>(null)
  const neighborIdsRef = useRef<ReadonlySet<string>>(EMPTY_SET)
  const simulationRef = useRef<d3.Simulation<D3GraphNode, D3GraphLink> | null>(
    null,
  )
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const scheduleRenderRef = useRef<(() => void) | null>(null)
  const sizeRef = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })

  // Simulation & Rendering Setup
  useEffect(() => {
    if (!data || !canvasRef.current || !containerRef.current) return

    const container = containerRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // --- Canvas sizing helper ---
    const updateCanvasSize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { width, height }
      return { width, height }
    }

    const { width, height } = updateCanvasSize()

    const { physics, theme } = GRAPH_CONFIG

    const simulation = d3
      .forceSimulation<D3GraphNode>(data.nodes)
      .force(
        'link',
        d3
          .forceLink<D3GraphNode, D3GraphLink>(data.links)
          .id((d) => d.id)
          .distance(physics.linkDistance),
      )
      .force('charge', d3.forceManyBody().strength(physics.chargeStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(physics.centerStrength))
      .force('y', d3.forceY(height / 2).strength(physics.centerStrength))
      .force('collide', d3.forceCollide().radius(physics.collideRadius))

    simulationRef.current = simulation

    const activeTheme = isDark ? theme.dark : theme.light

    let animationFrameId: number | null = null
    let needsRedraw = true

    const render = () => {
      if (!needsRedraw) return
      const { width: w, height: h } = sizeRef.current
      renderGraph(
        ctx,
        w,
        h,
        data.nodes,
        data.links,
        transformRef.current,
        isDark,
        activeTheme,
        hoverNodeRef.current,
        neighborIdsRef.current,
      )
      needsRedraw = false
    }

    const scheduleRender = () => {
      needsRedraw = true
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
          animationFrameId = null
          render()
        })
      }
    }

    // Re-render on simulation tick
    simulation.on('tick', scheduleRender)

    // Initial render
    scheduleRender()
    scheduleRenderRef.current = scheduleRender

    // --- ResizeObserver ---
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
      scheduleRender()
    })
    resizeObserver.observe(container)

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent(GRAPH_CONFIG.interaction.zoomExtent)
      .on('zoom', (event) => {
        transformRef.current = event.transform
        scheduleRender()
      })

    d3.select(canvas).call(zoom)

    const drag = d3
      .drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const transform = transformRef.current
        const x = transform.invertX(event.x),
          y = transform.invertY(event.y)
        return data.nodes.find((n) => Math.hypot(n.x! - x, n.y! - y) < 20)
      })
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(physics.alphaTarget).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
      })
      .on('drag', (event) => {
        const transform = transformRef.current
        event.subject.fx = transform.invertX(event.sourceEvent.offsetX)
        event.subject.fy = transform.invertY(event.sourceEvent.offsetY)
      })
      .on('end', (event) => {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
      })

    d3.select(canvas).call(drag)

    return () => {
      simulation.stop()
      resizeObserver.disconnect()
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
      scheduleRenderRef.current = null
    }
  }, [data, isDark])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!data) return
      const transform = transformRef.current
      const x = transform.invertX(e.nativeEvent.offsetX),
        y = transform.invertY(e.nativeEvent.offsetY)
      const hovered = data.nodes.find((node) => {
        if (node.x === undefined || node.y === undefined) return false
        return (
          Math.hypot(node.x - x, node.y - y) <
          GRAPH_CONFIG.interaction.hitRadius
        )
      })
      if (hovered?.id !== hoverNodeRef.current?.id) {
        hoverNodeRef.current = hovered || null
        neighborIdsRef.current = hovered
          ? buildNeighborIds(hovered.id, data.links)
          : EMPTY_SET
        scheduleRenderRef.current?.()
      }
      document.body.style.cursor = hovered ? 'pointer' : 'default'
    },
    [data],
  )

  const handleClick = useCallback(() => {
    const target = hoverNodeRef.current
    if (!target) return
    if (target.group === 'post') {
      window.location.href = `/blog/${target.id}`
    } else if (target.group === 'tag') {
      window.location.href = `/tags/${target.id.replace(/^tag-/, '')}`
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`bg-background relative h-[600px] w-full overflow-hidden rounded-lg border transition-opacity duration-100 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <canvas
        ref={canvasRef}
        className="block cursor-move"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />
    </div>
  )
}
