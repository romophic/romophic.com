import { useEffect, useState, useRef, lazy, Suspense } from 'react'

const ForceGraph2D = lazy(() => import('react-force-graph-2d'))

interface GraphNode {
  id: string
  name: string
  val: number
  group: string
  color?: string
  x?: number
  y?: number
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

  useEffect(() => {
    fetch('/graph.json')
      .then((res) => res.json())
      .then(setData)

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

    // Observer for theme change
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
          nodeLabel="name"
          nodeColor={(node) =>
            (node as GraphNode).group === 'tag'
              ? '#a855f7'
              : isDark
                ? '#e2e8f0'
                : '#1e293b'
          }
          backgroundColor={isDark ? '#262626' : '#f2f1f5'}
          linkColor={() =>
            isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
          }
          nodeRelSize={6}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
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
