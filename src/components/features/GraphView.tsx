import { useEffect, useState, useRef, lazy, Suspense, useCallback } from 'react'

const ForceGraph2D = lazy(() => import('react-force-graph-2d'))

interface GraphNode {
  id: string
  name: string
  val: number
  group: string
  color?: string
  x?: number
  y?: number
  neighbors?: GraphNode[]
  links?: GraphLink[]
}

interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  value: number
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export function GraphView() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] })
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [isDark, setIsDark] = useState(false)
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)

  useEffect(() => {
    fetch('/graph.json')
      .then((res) => res.json())
      .then((graphData: GraphData) => {
        // Pre-calculate neighbors and links for efficient highlighting
        graphData.links.forEach((link) => {
          const a = graphData.nodes.find(
            (n) => n.id === (typeof link.source === 'object' ? link.source.id : link.source)
          )
          const b = graphData.nodes.find(
            (n) => n.id === (typeof link.target === 'object' ? link.target.id : link.target)
          )

          if (a && b) {
            a.neighbors = a.neighbors || []
            b.neighbors = b.neighbors || []
            a.neighbors.push(b)
            b.neighbors.push(a)

            a.links = a.links || []
            b.links = b.links || []
            a.links.push(link)
            b.links.push(link)
          }
        })
        setData(graphData)
      })

    // Resize handler
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.clientWidth)
        setHeight(containerRef.current.clientHeight)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    // Check theme
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
      attributeFilter: ['data-theme', 'class'],
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
    }
  }, [])

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isHover = node === hoverNode
      const isNeighbor = hoverNode?.neighbors?.includes(node)
      const shouldHighlight = isHover || isNeighbor

      // Base size
      const radius = node.val * 3

      // Colors
      const nodeColor =
        node.group === 'tag'
          ? '#a855f7' // Purple for tags
          : isDark
            ? '#e2e8f0' // Slate-200 for posts (Dark mode)
            : '#1e293b' // Slate-800 for posts (Light mode)
      
      const dimmedColor = isDark ? '#475569' : '#cbd5e1' // Dimmed color

      // Draw Node
      ctx.beginPath()
      ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = hoverNode && !shouldHighlight ? dimmedColor : nodeColor
      ctx.fill()

      // Highlight ring
      if (shouldHighlight) {
        ctx.lineWidth = 2 / globalScale
        ctx.strokeStyle = isDark ? '#fff' : '#000'
        ctx.stroke()
      }

      // Label
      const label = node.name
      const fontSize = 12 / globalScale
      ctx.font = `${fontSize}px Sans-Serif`
      
      // Show label on hover or if high zoom
      if (shouldHighlight || globalScale > 1.5) {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = isDark ? '#fff' : '#000'
        // Draw text background for readability
        const textWidth = ctx.measureText(label).width
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)
        ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'
        ctx.fillRect(
          node.x! - bckgDimensions[0] / 2, 
          node.y! + radius + 2, 
          bckgDimensions[0], 
          bckgDimensions[1]
        )
        
        ctx.fillStyle = isDark ? '#fff' : '#000'
        ctx.fillText(label, node.x!, node.y! + radius + 2 + fontSize / 2)
      }
    },
    [isDark, hoverNode]
  )

  const paintNodePointerArea = useCallback((node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
    const radius = node.val * 3 + 6 // +6px padding for easier clicking
    ctx.beginPath()
    ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = color
    ctx.fill()
  }, [])

  return (
    <div
      ref={containerRef}
      className="bg-background h-[600px] w-full overflow-hidden rounded-lg border"
    >
      <Suspense
        fallback={
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Loading graph...
          </div>
        }
      >
        <ForceGraph2D
          width={width}
          height={height}
          graphData={data}
          cooldownTicks={100}
          backgroundColor={isDark ? '#262626' : '#f2f1f5'}
          
          // Node styling
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={paintNodePointerArea}
          
          // Link styling
          linkColor={() => isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
          linkWidth={(link) => {
            const isConnected = hoverNode && (
              link.source === hoverNode || link.target === hoverNode
            )
            return isConnected ? 2 : 1
          }}
          linkDirectionalParticles={data.links.length > 100 ? 0 : 2}
          linkDirectionalParticleSpeed={0.005}
          
          // Interaction
          onNodeHover={(node) => {
            document.body.style.cursor = node ? 'pointer' : 'default'
            setHoverNode((node as GraphNode) || null)
          }}
          onNodeClick={(node) => {
            const n = node as GraphNode
            if (n.group === 'post') {
              window.location.href = `/blog/${n.id}`
            }
          }}
        />
      </Suspense>
    </div>
  )
}
