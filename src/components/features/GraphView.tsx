import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphNode, D3GraphLink } from '@/types'

interface GraphData {
  nodes: D3GraphNode[]
  links: D3GraphLink[]
}

export function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDark, setIsDark] = useState(false)
  const [data, setData] = useState<GraphData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  const hoverNodeRef = useRef<D3GraphNode | null>(null)
  const simulationRef = useRef<d3.Simulation<D3GraphNode, D3GraphLink> | null>(
    null,
  )
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)

  // 1. Data Fetching & Processing
  useEffect(() => {
    fetch('/graph.json')
      .then((res) => res.json())
      .then((fetchedData: { nodes: D3GraphNode[], links: D3GraphLink[] }) => {
        const seenIds = new Set<string>()
        const nodes: D3GraphNode[] = []

        fetchedData.nodes.forEach((n) => {
          if (!n.id || seenIds.has(n.id)) return
          seenIds.add(n.id)
          nodes.push({ ...n, val: 5, degree: 0 })
        })

        const nodeMap = new Map<string, D3GraphNode>(
          nodes.map((n) => [n.id, n]),
        )
        const links: D3GraphLink[] = []

        let categoryIdx = 0
        const tagToCategory = new Map<string, number>()

        fetchedData.links.forEach((l) => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source
          const targetId = typeof l.target === 'object' ? l.target.id : l.target

          if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
            links.push({ ...l, particles: [] })
            const s = nodeMap.get(sourceId)!
            const t = nodeMap.get(targetId)!
            s.degree = (s.degree || 0) + 1
            t.degree = (t.degree || 0) + 1
          }
        })

        nodes.forEach((n) => {
          if (n.group === 'tag') {
            tagToCategory.set(
              n.id,
              categoryIdx % GRAPH_CONFIG.theme.palettes.dark.length,
            )
            n.category = categoryIdx % GRAPH_CONFIG.theme.palettes.dark.length
            categoryIdx++
          }
        })

        nodes.forEach((n) => {
          if (n.group === 'post') {
            const connectedTag = links.find((l) => {
              const sId = typeof l.source === 'object' ? l.source.id : l.source
              const tId = typeof l.target === 'object' ? l.target.id : l.target
              const otherId = sId === n.id ? tId : sId
              return nodeMap.get(otherId as string)?.group === 'tag'
            })
            if (connectedTag) {
              const sId =
                typeof connectedTag.source === 'object'
                  ? connectedTag.source.id
                  : connectedTag.source
              const tagId =
                sId === n.id ? connectedTag.target : connectedTag.source
              const idStr = typeof tagId === 'object' ? tagId.id : tagId
              n.category = tagToCategory.get(idStr as string)
            }
          }
        })

        const initialX = 400
        const initialY = 300
        const { initialRadius } = GRAPH_CONFIG.physics
        nodes.forEach((n) => {
          n.x = initialX + (Math.random() - 0.5) * initialRadius
          n.y = initialY + (Math.random() - 0.5) * initialRadius
        })

        setData({ nodes, links })
        setTimeout(() => setIsVisible(true), 100)
      })
  }, [])

  // 2. Theme Detection
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode =
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.documentElement.classList.contains('dark')
      setIsDark(isDarkMode)
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  // 3. Simulation & Rendering Setup
  useEffect(() => {
    if (!data || !canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

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
    const palettes = theme.palettes

    const getNodeColor = (node: D3GraphNode) => {
      if (node.category !== undefined) {
        return isDark
          ? palettes.dark[node.category]
          : palettes.light[node.category]
      }
      return activeTheme.nodeDefault
    }

    const drawArrow = (
      context: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      radius: number,
    ) => {
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const arrowLength = 5
      const tx = x2 - radius * Math.cos(angle)
      const ty = y2 - radius * Math.sin(angle)
      context.beginPath()
      context.moveTo(tx, ty)
      context.lineTo(
        tx - arrowLength * Math.cos(angle - Math.PI / 7),
        ty - arrowLength * Math.sin(angle - Math.PI / 7),
      )
      context.lineTo(
        tx - arrowLength * Math.cos(angle + Math.PI / 7),
        ty - arrowLength * Math.sin(angle + Math.PI / 7),
      )
      context.closePath()
      context.fill()
    }

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const transform = transformRef.current
      ctx.save()
      ctx.translate(transform.x, transform.y)
      ctx.scale(transform.k, transform.k)

      const currentHover = hoverNodeRef.current

      // Grid
      if (isDark) {
        ctx.strokeStyle = activeTheme.grid
        ctx.lineWidth = 1 / transform.k
        const gridSize = 50
        const xStart = -width * 2,
          xEnd = width * 2,
          yStart = -height * 2,
          yEnd = height * 2
        ctx.beginPath()
        for (let x = xStart; x < xEnd; x += gridSize) {
          ctx.moveTo(x, yStart)
          ctx.lineTo(x, yEnd)
        }
        for (let y = yStart; y < yEnd; y += gridSize) {
          ctx.moveTo(xStart, y)
          ctx.lineTo(xEnd, y)
        }
        ctx.stroke()
      }

      // Links
      data.links.forEach((link) => {
        const source = link.source as D3GraphNode,
          target = link.target as D3GraphNode
        const isRelated =
          currentHover &&
          (source.id === currentHover.id || target.id === currentHover.id)

        ctx.beginPath()
        ctx.moveTo(source.x!, source.y!)
        ctx.lineTo(target.x!, target.y!)
        ctx.strokeStyle = isRelated
          ? activeTheme.linkHighlight
          : activeTheme.link
        ctx.lineWidth = isRelated ? 1.5 : 0.6
        ctx.stroke()

        if (isRelated) {
          ctx.fillStyle = activeTheme.linkHighlight
          drawArrow(ctx, source.x!, source.y!, target.x!, target.y!, 8)
        }

        // Particles
        if (!link.particles) link.particles = []
        if (Math.random() < 0.005) link.particles.push(0)
        ctx.fillStyle = activeTheme.particle
        for (let i = link.particles.length - 1; i >= 0; i--) {
          link.particles[i] += 0.008
          if (link.particles[i] >= 1) {
            link.particles.splice(i, 1)
            continue
          }
          const px = source.x! + (target.x! - source.x!) * link.particles[i]
          const py = source.y! + (target.y! - source.y!) * link.particles[i]
          ctx.beginPath()
          ctx.arc(px, py, 1.5 / transform.k, 0, 2 * Math.PI)
          ctx.fill()
        }
      })

      // Nodes
      data.nodes.forEach((node) => {
        const isHover = currentHover?.id === node.id
        const isNeighbor =
          currentHover &&
          data.links.some((l) => {
            const sId = typeof l.source === 'object' ? l.source.id : l.source
            const tId = typeof l.target === 'object' ? l.target.id : l.target
            return (
              (sId === currentHover.id && tId === node.id) ||
              (tId === currentHover.id && sId === node.id)
            )
          })

        const baseRadius = node.group === 'tag' ? 4 : 6
        const radius = isHover ? baseRadius * 1.5 : baseRadius
        const nodeColor = getNodeColor(node)

        // Halo
        if (isHover || isNeighbor) {
          ctx.beginPath()
          ctx.arc(node.x!, node.y!, radius + 6, 0, 2 * Math.PI)
          ctx.fillStyle =
            node.group === 'tag'
              ? 'rgba(168, 85, 247, 0.2)'
              : isDark
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(0, 0, 0, 0.05)'
          ctx.fill()
        }

        // Core
        ctx.beginPath()
        ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI)

        ctx.shadowColor = isDark ? nodeColor : 'rgba(0, 0, 0, 0.3)'
        ctx.shadowBlur = isHover
          ? activeTheme.glowIntensityHover
          : activeTheme.glowIntensity

        ctx.fillStyle = nodeColor
        ctx.fill()
        ctx.shadowBlur = 0

        // Label
        const degree = node.degree || 0
        const isImportant = degree > GRAPH_CONFIG.interaction.importantDegree
        if (
          isHover ||
          transform.k > GRAPH_CONFIG.interaction.lodThreshold ||
          (transform.k > 0.6 && isImportant)
        ) {
          const label = node.name
          ctx.save()
          ctx.translate(node.x!, node.y!)
          ctx.scale(1 / transform.k, 1 / transform.k)
          ctx.font = `${isHover || isImportant ? '600' : 'normal'} 12px Sans-Serif`
          const textWidth = ctx.measureText(label).width

          ctx.fillStyle = isDark
            ? 'rgba(0, 0, 0, 0.75)'
            : 'rgba(255, 255, 255, 0.85)'
          const px = -textWidth / 2 - 4,
            py = radius * transform.k + 6,
            pw = textWidth + 8,
            ph = 18,
            pr = 4
          ctx.beginPath()
          ctx.moveTo(px + pr, py)
          ctx.lineTo(px + pw - pr, py)
          ctx.quadraticCurveTo(px + pw, py, px + pw, py + pr)
          ctx.lineTo(px + pw, py + ph - pr)
          ctx.quadraticCurveTo(px + pw, py + ph, px + pw - pr, py + ph)
          ctx.lineTo(px + pr, py + ph)
          ctx.quadraticCurveTo(px, py + ph, px, py + ph - pr)
          ctx.lineTo(px, py + pr)
          ctx.quadraticCurveTo(px, py, px + pr, py)
          ctx.fill()
          if (!isDark) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
            ctx.lineWidth = 0.5
            ctx.stroke()
          }

          ctx.fillStyle = isDark ? '#fff' : '#000'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(label, 0, radius * transform.k + 8)
          ctx.restore()
        }
      })

      ctx.restore()
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    const zoom = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent(GRAPH_CONFIG.interaction.zoomExtent)
      .on('zoom', (event) => {
        transformRef.current = event.transform
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
      cancelAnimationFrame(animationFrameId)
    }
  }, [data, isDark])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!data) return
    const transform = transformRef.current
    const x = transform.invertX(e.nativeEvent.offsetX),
      y = transform.invertY(e.nativeEvent.offsetY)
    const hovered = data.nodes.find((node) => {
      if (node.x === undefined || node.y === undefined) return false
      return (
        Math.hypot(node.x - x, node.y - y) < GRAPH_CONFIG.interaction.hitRadius
      )
    })
    if (hovered?.id !== hoverNodeRef.current?.id) {
      hoverNodeRef.current = hovered || null
    }
    document.body.style.cursor = hovered ? 'pointer' : 'default'
  }

  const handleClick = () => {
    const target = hoverNodeRef.current
    if (target && target.group === 'post') {
      window.location.href = `/blog/${target.id}`
    }
  }

  return (
    <div
      ref={containerRef}
      className={`bg-background relative h-[600px] w-full overflow-hidden rounded-lg border transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
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
