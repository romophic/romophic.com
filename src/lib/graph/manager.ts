import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphLink, D3GraphNode } from '@/types'
import { zoomIdentity, type ZoomTransform } from 'd3-zoom'
import { buildGraphData, type RawGraphData } from './data'
import type { PhysicsController } from './physics'
import { renderGraph } from './renderer'
import { setupPhysics } from './physics'
import { setupInteraction, EMPTY_SET } from './interaction'

export class GraphViewManager {
  private container: HTMLDivElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null

  private data: { nodes: D3GraphNode[]; links: D3GraphLink[] } | null = null
  private isDark = false
  private fullInteraction = true

  private hoverNode: D3GraphNode | null = null
  private neighborIds: ReadonlySet<string> = EMPTY_SET
  private currentTransform: ZoomTransform = zoomIdentity

  private size = { width: 0, height: 0 }
  private animationFrameId: number | null = null
  private fadeInTimeoutId: ReturnType<typeof setTimeout> | null = null
  private needsRedraw = true
  private lastDrawTime = 0
  private isInteractive = false

  private physicsController: PhysicsController | null = null
  private resizeObserver: ResizeObserver | null = null
  private styleObserver: MutationObserver | null = null
  private themeObserver: MutationObserver | null = null

  private interactionCleanup: (() => void) | null = null

  private abortController = new AbortController()
  private destroyed = false

  constructor(containerId: string, canvasId: string) {
    this.container = document.getElementById(containerId) as HTMLDivElement
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    this.ctx = this.canvas?.getContext('2d')

    this.fullInteraction =
      this.container?.getAttribute('data-full-interaction') !== 'false'

    if (!this.container || !this.canvas || !this.ctx) return

    this.checkTheme = this.checkTheme.bind(this)
    this.scheduleRender = this.scheduleRender.bind(this)
    this.render = this.render.bind(this)
    this.updateCanvasSize = this.updateCanvasSize.bind(this)
    this.handleNodeClick = this.handleNodeClick.bind(this)

    this.initThemeDetection()
    this.fetchData()
      .then(() => {
        if (this.destroyed) return
        this.initVisualization()
      })
      .catch((err) => {
        if (!this.destroyed) {
          console.error('Graph initialization failed:', err)
        }
      })
  }

  private initThemeDetection() {
    this.checkTheme()
    this.themeObserver = new MutationObserver(this.checkTheme)
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
  }

  private checkTheme() {
    this.isDark =
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.classList.contains('dark')
    if (this.data) this.scheduleRender()
  }

  private async fetchData() {
    const endpoint = '/graph.json'
    const res = await fetch(endpoint, { signal: this.abortController.signal })
    if (!res.ok)
      throw new Error(`HTTP ${res.status}: Failed to fetch ${endpoint}`)
    const raw: RawGraphData = await res.json()

    const initialX = this.container.clientWidth / 2 || window.innerWidth / 2
    const initialY = this.container.clientHeight / 2 || window.innerHeight / 2
    this.data = buildGraphData(raw, { x: initialX, y: initialY })

    this.fadeInTimeoutId = setTimeout(() => {
      this.fadeInTimeoutId = null
      this.container.classList.remove('opacity-0')
      this.container.classList.add('opacity-100')
    }, 100)
  }

  private updateCanvasSize() {
    const width = this.container.clientWidth
    const height = this.container.clientHeight
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.size = { width, height }
  }

  private initVisualization() {
    if (this.destroyed || !this.data || !this.ctx) return

    this.updateCanvasSize()
    const { width, height } = this.size

    // Empty graph: nothing to simulate or interact with
    if (!this.data.nodes.length) return

    // Physics
    const reducedMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    this.physicsController = setupPhysics(
      this.data.nodes,
      this.data.links,
      width,
      height,
      (updatedNodes) => {
        if (!this.data) return
        const nodeMap = new Map(this.data.nodes.map((n) => [n.id, n]))
        for (const un of updatedNodes) {
          const n = nodeMap.get(un.id)
          if (n) {
            n.x = un.x
            n.y = un.y
            n.vx = un.vx
            n.vy = un.vy
          }
        }
        this.scheduleRender()
      },
      reducedMotion,
    )

    // Resize Observer: keep the canvas and the force center in sync
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize()
      this.physicsController?.resize(this.size.width, this.size.height)
      this.scheduleRender()
    })
    this.resizeObserver.observe(this.container)

    // Pause the simulation while the tab is hidden
    document.addEventListener(
      'visibilitychange',
      () => this.physicsController?.setVisible(!document.hidden),
      { signal: this.abortController.signal },
    )

    // Interaction
    const { cleanup, getInitialTransform } = setupInteraction(
      this.canvas,
      this.data.nodes,
      this.data.links,
      this.physicsController,
      width,
      height,
      (t) => {
        this.currentTransform = t
        this.scheduleRender()
      },
      (hovered, neighbors) => {
        this.hoverNode = hovered
        this.neighborIds = neighbors
        this.scheduleRender()
      },
      this.handleNodeClick,
      this.fullInteraction,
    )
    this.interactionCleanup = cleanup
    this.currentTransform = getInitialTransform()

    // Watch for interactive mode toggle via pointer-events on wrapper
    const wrapper =
      this.container.closest('[data-graph-wrapper]') ||
      this.container.parentElement
    if (wrapper) {
      this.isInteractive =
        (wrapper as HTMLElement).style.pointerEvents === 'auto'
      this.styleObserver = new MutationObserver(() => {
        this.isInteractive =
          (wrapper as HTMLElement).style.pointerEvents === 'auto'
        this.physicsController?.setInteractive(this.isInteractive)
        if (this.isInteractive) this.scheduleRender()
      })
      this.styleObserver.observe(wrapper, {
        attributes: true,
        attributeFilter: ['style'],
      })
    }

    this.physicsController?.setInteractive(this.isInteractive)
    this.scheduleRender()
  }

  private scheduleRender() {
    this.needsRedraw = true
    if (this.animationFrameId === null) {
      this.animationFrameId = requestAnimationFrame((time) => {
        this.animationFrameId = null
        this.render(time)
      })
    }
  }

  private render(time: number) {
    if (!this.needsRedraw || !this.data || !this.ctx) return

    // Throttle to ~30fps if the graph is behind the glass pane
    if (!this.isInteractive) {
      const elapsed = time - this.lastDrawTime
      if (elapsed < 33) {
        this.scheduleRender()
        return
      }
    }
    this.lastDrawTime = time

    const { width: w, height: h } = this.size
    const { theme } = GRAPH_CONFIG
    const activeTheme = this.isDark ? theme.dark : theme.light

    renderGraph(
      this.ctx,
      w,
      h,
      this.data.nodes,
      this.data.links,
      this.currentTransform,
      this.isDark,
      activeTheme,
      this.hoverNode,
      this.neighborIds,
      this.isInteractive,
    )

    this.needsRedraw = false
  }

  private handleNodeClick(target: D3GraphNode | null) {
    if (!target) return
    if (target.group === 'post') {
      window.location.href = `/blog/${target.id}`
    } else if (target.group === 'tag') {
      window.location.href = `/tags/${encodeURIComponent(target.id.replace(/^tag-/, ''))}/`
    }
  }

  public destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.abortController.abort()

    this.resizeObserver?.disconnect()
    this.styleObserver?.disconnect()
    this.themeObserver?.disconnect()

    if (this.interactionCleanup) this.interactionCleanup()
    this.interactionCleanup = null

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.fadeInTimeoutId !== null) {
      clearTimeout(this.fadeInTimeoutId)
      this.fadeInTimeoutId = null
    }

    this.physicsController?.destroy()
    this.physicsController = null
    this.data = null
  }
}
