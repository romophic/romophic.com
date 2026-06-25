import { GRAPH_CONFIG } from '@/consts'
import type { D3GraphLink, D3GraphNode } from '@/types'
import { zoomIdentity, type ZoomTransform } from 'd3-zoom'
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
      .then(() => this.initVisualization())
      .catch((err) => console.error('Graph initialization failed:', err))
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
    const res = await fetch(endpoint)
    if (!res.ok)
      throw new Error(`HTTP ${res.status}: Failed to fetch ${endpoint}`)
    const fetchedData: { nodes: D3GraphNode[]; links: D3GraphLink[] } =
      await res.json()

    const seenIds = new Set<string>()
    const nodes: D3GraphNode[] = []

    fetchedData.nodes.forEach((n) => {
      if (!n.id || seenIds.has(n.id)) return
      seenIds.add(n.id)
      nodes.push({ ...n, val: 5, degree: 0 })
    })

    const nodeMap = new Map<string, D3GraphNode>(nodes.map((n) => [n.id, n]))
    const links: D3GraphLink[] = []

    let categoryIdx = 0
    const tagToCategory = new Map<string, number>()
    const linkMap = new Map<string, D3GraphLink>()

    fetchedData.links.forEach((l) => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source
      const targetId = typeof l.target === 'object' ? l.target.id : l.target

      if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
        const s = nodeMap.get(sourceId)!
        const t = nodeMap.get(targetId)!

        const reverseKey = `${targetId}->${sourceId}`
        const reverseLink = linkMap.get(reverseKey)

        if (reverseLink) {
          ;(reverseLink as unknown as Record<string, unknown>).isBidirectional =
            true
          links.push({
            ...l,
            source: s,
            target: t,
            isReverse: true,
          } as unknown as D3GraphLink)
        } else {
          const newLink = { ...l, source: s, target: t, isBidirectional: false }
          linkMap.set(
            `${sourceId}->${targetId}`,
            newLink as unknown as D3GraphLink,
          )
          links.push(newLink as unknown as D3GraphLink)
        }

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

    const initialX = this.container.clientWidth / 2 || window.innerWidth / 2
    const initialY = this.container.clientHeight / 2 || window.innerHeight / 2
    const { initialRadius } = GRAPH_CONFIG.physics
    nodes.forEach((n) => {
      n.x = initialX + (Math.random() - 0.5) * initialRadius
      n.y = initialY + (Math.random() - 0.5) * initialRadius
    })

    this.data = { nodes, links }

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
    if (!this.data || !this.ctx) return

    this.updateCanvasSize()
    const { width, height } = this.size

    // Physics
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
    )

    // Resize Observer
    this.resizeObserver = new ResizeObserver(() => {
      this.updateCanvasSize()
      this.scheduleRender()
    })
    this.resizeObserver.observe(this.container)

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
      window.location.href = `/blog?tag=${encodeURIComponent(target.id.replace(/^tag-/, ''))}`
    }
  }

  public destroy() {
    this.resizeObserver?.disconnect()
    this.styleObserver?.disconnect()
    this.themeObserver?.disconnect()
    if (this.interactionCleanup) this.interactionCleanup()
    if (this.animationFrameId !== null)
      cancelAnimationFrame(this.animationFrameId)
    if (this.fadeInTimeoutId !== null) clearTimeout(this.fadeInTimeoutId)
    this.physicsController?.destroy()
  }
}
