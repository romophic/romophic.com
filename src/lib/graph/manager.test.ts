import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { D3GraphNode, D3GraphLink } from '@/types'

const h = vi.hoisted(() => ({
  data: { nodes: [] as D3GraphNode[], links: [] as D3GraphLink[] },
  interactionSetup: vi.fn(),
  interactionCleanup: vi.fn(),
  getInitialTransform: vi.fn(),
  physicsSetup: vi.fn(),
  physicsDestroy: vi.fn(),
  renderGraph: vi.fn(),
}))

vi.mock('./interaction', () => ({
  EMPTY_SET: new Set<string>(),
  setupInteraction: (...args: unknown[]) => h.interactionSetup(...args),
}))

vi.mock('./physics', () => ({
  setupPhysics: (...args: unknown[]) => h.physicsSetup(...args),
}))

vi.mock('./renderer', () => ({
  renderGraph: (...args: unknown[]) => h.renderGraph(...args),
}))

vi.mock('./data', () => ({
  buildGraphData: vi.fn(() => h.data),
}))

import { GraphViewManager } from './manager'

function makeNodes(): D3GraphNode[] {
  return [
    { id: 'post-1', name: 'Post 1', group: 'post', val: 2 },
    { id: 'tag-ml', name: 'ml', group: 'tag', val: 1 },
  ]
}

function makeLinks(): D3GraphLink[] {
  return [{ source: 'post-1', target: 'tag-ml' }]
}

function makeDom(graph?: { nodes: D3GraphNode[]; links: D3GraphLink[] }) {
  h.data.nodes = graph?.nodes ?? makeNodes()
  h.data.links = graph?.links ?? makeLinks()

  const rafCallbacks: Array<(time: number) => void> = []
  const mutationCallbacks: Array<() => void> = []
  const resizeCallbacks: Array<() => void> = []

  const container = {
    clientWidth: 400,
    clientHeight: 300,
    getAttribute: vi.fn(() => 'true'),
    classList: { add: vi.fn(), remove: vi.fn() },
    closest: vi.fn(() => null),
    parentElement: null,
    style: {},
  }

  const ctx = { setTransform: vi.fn() }
  const canvas = {
    width: 0,
    height: 0,
    style: {} as Record<string, string>,
    getContext: vi.fn(() => ctx),
  }

  class FakeMutationObserver {
    constructor(cb: () => void) {
      mutationCallbacks.push(cb)
    }
    observe = vi.fn()
    disconnect = vi.fn()
  }
  class FakeResizeObserver {
    constructor(cb: () => void) {
      resizeCallbacks.push(cb)
    }
    observe = vi.fn()
    disconnect = vi.fn()
  }

  const docListeners = new Map<string, () => void>()
  const documentElement = {
    getAttribute: vi.fn(() => 'light'),
    classList: { contains: vi.fn(() => false) },
  }

  ;(globalThis as unknown as Record<string, unknown>).document = {
    getElementById: vi.fn((id: string) =>
      id === 'graph-container' ? container : canvas,
    ),
    documentElement,
    addEventListener: vi.fn((type: string, fn: () => void) =>
      docListeners.set(type, fn),
    ),
    hidden: false,
  }
  ;(globalThis as unknown as Record<string, unknown>).window = {
    matchMedia: vi.fn(() => ({ matches: true })),
    location: { href: 'https://romophic.com/' },
    devicePixelRatio: 2,
    innerWidth: 800,
    innerHeight: 600,
  }
  ;(globalThis as unknown as Record<string, unknown>).MutationObserver = FakeMutationObserver
  ;(globalThis as unknown as Record<string, unknown>).ResizeObserver = FakeResizeObserver
  ;(globalThis as unknown as Record<string, unknown>).requestAnimationFrame = vi.fn(
    (cb: (t: number) => void) => {
      rafCallbacks.push(cb)
      return rafCallbacks.length
    },
  )
  ;(globalThis as unknown as Record<string, unknown>).cancelAnimationFrame = vi.fn()
  ;(globalThis as unknown as Record<string, unknown>).fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ nodes: [], links: [] }) })
  ;(globalThis as unknown as Record<string, unknown>).console = { ...console, error: vi.fn() }

  return {
    container,
    canvas,
    ctx,
    documentElement,
    docListeners,
    mutationCallbacks,
    resizeCallbacks,
    rafCallbacks,
    flush: () => new Promise((resolve) => setTimeout(resolve, 0)),
  }
}

async function createManager(dom: ReturnType<typeof makeDom>) {
  const manager = new GraphViewManager('graph-container', 'graph-canvas')
  await dom.flush()
  return manager
}

/** Renders every pending animation frame at the given timestamp. */
function runFrame(
  dom: ReturnType<typeof makeDom>,
  time: number,
): number {
  const count = dom.rafCallbacks.length
  dom.rafCallbacks.splice(0).forEach((cb) => cb(time))
  return count
}

describe('GraphViewManager (Test as Documentation)', () => {
  let dom: ReturnType<typeof makeDom>

  beforeEach(() => {
    vi.clearAllMocks()
    h.getInitialTransform.mockReturnValue({ k: 1, x: 0, y: 0 })
    h.interactionSetup.mockReturnValue({
      cleanup: h.interactionCleanup,
      getInitialTransform: h.getInitialTransform,
    })
    h.physicsSetup.mockReturnValue({
      resize: vi.fn(),
      setVisible: vi.fn(),
      setInteractive: vi.fn(),
      destroy: h.physicsDestroy,
    })
    dom = makeDom()
  })

  afterEach(() => {
    for (const key of [
      'document',
      'window',
      'MutationObserver',
      'ResizeObserver',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'fetch',
    ]) {
      delete (globalThis as unknown as Record<string, unknown>)[key]
    }
  })

  it('fetches /graph.json and wires physics, interaction, and the first render', async () => {
    const manager = await createManager(dom)

    expect((globalThis as unknown as Record<string, unknown>).fetch).toHaveBeenCalledWith(
      '/graph.json',
      expect.objectContaining({ signal: expect.anything() }),
    )

    // Canvas is sized for the device pixel ratio
    expect(dom.canvas.width).toBe(800)
    expect(dom.canvas.height).toBe(600)
    expect(dom.ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0)

    // Reduced motion preference is forwarded to the simulation
    expect(h.physicsSetup).toHaveBeenCalledTimes(1)
    expect(h.physicsSetup.mock.calls[0][5]).toBe(true)

    // The graph listens for tab visibility to pause the simulation
    expect(dom.docListeners.has('visibilitychange')).toBe(true)

    expect(h.interactionSetup).toHaveBeenCalledTimes(1)
    const args = h.interactionSetup.mock.calls[0]
    expect(args[0]).toBe(dom.canvas)
    expect(args[9]).toBe(true) // fullInteraction from the container data attr

    // First frame renders through the shared renderer
    expect(runFrame(dom, 1000)).toBe(1)
    expect(h.renderGraph).toHaveBeenCalledTimes(1)
    const renderArgs = h.renderGraph.mock.calls[0]
    expect(renderArgs[0]).toBe(dom.ctx)
    expect(renderArgs[1]).toBe(400)
    expect(renderArgs[2]).toBe(300)
    expect(renderArgs[3].map((n: D3GraphNode) => n.id)).toEqual([
      'post-1',
      'tag-ml',
    ])

    manager.destroy()
  })

  it('routes post and tag clicks to their pages', async () => {
    const manager = await createManager(dom)
    const onClick = h.interactionSetup.mock.calls[0][8]

    onClick({ id: 'post-1', group: 'post' })
    expect((globalThis as unknown as Record<string, unknown>).window.location.href).toBe('/blog/post-1')

    onClick({ id: 'tag-ml', group: 'tag' })
    expect((globalThis as unknown as Record<string, unknown>).window.location.href).toBe('/tags/ml/')

    // Unknown groups and empty clicks stay put
    onClick(null)
    onClick({ id: 'x', group: 'other' } as unknown as D3GraphNode)
    expect((globalThis as unknown as Record<string, unknown>).window.location.href).toBe('/tags/ml/')

    manager.destroy()
  })

  it('re-renders in the dark theme when the document theme flips', async () => {
    const manager = await createManager(dom)
    runFrame(dom, 1000)
    expect(h.renderGraph.mock.calls[0][6]).toBe(false)

    dom.documentElement.getAttribute.mockReturnValue('dark')
    // Theme changes arrive through the MutationObserver callback
    dom.mutationCallbacks.forEach((cb) => cb())
    runFrame(dom, 2000)
    expect(h.renderGraph.mock.calls.at(-1)![6]).toBe(true)

    manager.destroy()
  })

  it('keeps the canvas and simulation in sync on container resizes', async () => {
    const manager = await createManager(dom)
    const controller = h.physicsSetup.mock.results[0].value

    dom.container.clientWidth = 600
    dom.resizeCallbacks.forEach((cb) => cb())

    expect(dom.canvas.width).toBe(1200)
    expect(controller.resize).toHaveBeenCalledWith(600, 300)
    expect(runFrame(dom, 1500)).toBe(1)

    manager.destroy()
  })

  it('bails out before any setup when the canvas or context is missing', async () => {
    ;(globalThis as unknown as Record<string, unknown>).document.getElementById = vi.fn(() => null)

    const manager = new GraphViewManager('graph-container', 'graph-canvas')
    await dom.flush()

    expect((globalThis as unknown as Record<string, unknown>).fetch).not.toHaveBeenCalled()
    // Defensive guard: initializing without data is a no-op
    expect(() =>
      (manager as unknown as { initVisualization: () => void }).initVisualization(),
    ).not.toThrow()
  })

  it('merges physics updates into the node data and schedules a frame', async () => {
    const manager = await createManager(dom)
    const onUpdate = h.physicsSetup.mock.calls[0][4]

    onUpdate([{ id: 'post-1', x: 9, y: 8, vx: 1, vy: 2 }])
    expect(h.data.nodes[0]).toMatchObject({ x: 9, y: 8, vx: 1, vy: 2 })
    expect(runFrame(dom, 1100)).toBe(1)

    // Unknown node ids are ignored
    onUpdate([{ id: 'ghost', x: 1, y: 1, vx: 0, vy: 0 }])
    expect(h.data.nodes[1]).not.toMatchObject({ x: 1 })

    manager.destroy()
  })

  it('resumes and pauses the simulation on tab visibility changes', async () => {
    const manager = await createManager(dom)
    const controller = h.physicsSetup.mock.results[0].value

    dom.docListeners.get('visibilitychange')!()
    expect(controller.setVisible).toHaveBeenCalledWith(true)

    manager.destroy()
  })

  it('feeds hover state through to the renderer', async () => {
    const manager = await createManager(dom)
    const onHover = h.interactionSetup.mock.calls[0][7]

    onHover(h.data.nodes[0], new Set(['tag-ml']))
    runFrame(dom, 1200)
    expect(h.renderGraph.mock.calls.at(-1)![8]).toBe(h.data.nodes[0])
    expect(h.renderGraph.mock.calls.at(-1)![9]).toEqual(new Set(['tag-ml']))

    manager.destroy()
  })

  it('wakes the simulation when the wrapper becomes interactive', async () => {
    const wrapper = { style: { pointerEvents: 'auto' } }
    dom.container.closest.mockReturnValue(wrapper)
    const manager = await createManager(dom)
    const controller = h.physicsSetup.mock.results[0].value

    // Initial state is read from the wrapper, then style flips are observed
    expect(controller.setInteractive).toHaveBeenCalledWith(true)

    wrapper.style.pointerEvents = 'none'
    dom.mutationCallbacks.at(-1)!()
    expect(controller.setInteractive).toHaveBeenLastCalledWith(false)

    manager.destroy()
  })

  it('skips rendering when no redraw is pending', async () => {
    const manager = await createManager(dom)
    runFrame(dom, 1000)
    expect(h.renderGraph).toHaveBeenCalledTimes(1)

    // A render call with needsRedraw false returns immediately
    ;(manager as unknown as { render: (t: number) => void }).render(1100)
    expect(h.renderGraph).toHaveBeenCalledTimes(1)

    manager.destroy()
  })

  it('fades the container in shortly after the data arrives', async () => {
    vi.useFakeTimers()
    const manager = new GraphViewManager('graph-container', 'graph-canvas')
    await vi.advanceTimersByTimeAsync(0)

    // Still invisible before the 100ms fade timer fires
    expect(dom.container.classList.remove).not.toHaveBeenCalledWith('opacity-0')
    vi.advanceTimersByTime(100)
    expect(dom.container.classList.remove).toHaveBeenCalledWith('opacity-0')
    expect(dom.container.classList.add).toHaveBeenCalledWith('opacity-100')

    vi.useRealTimers()
    manager.destroy()
  })

  it('skips visualization entirely for an empty graph', async () => {
    dom = makeDom({ nodes: [], links: [] })
    const manager = await createManager(dom)

    expect(h.physicsSetup).not.toHaveBeenCalled()
    expect(h.interactionSetup).not.toHaveBeenCalled()

    manager.destroy()
  })

  it('does not initialize when the graph data cannot be fetched', async () => {
    ;(globalThis as unknown as Record<string, unknown>).fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500 })
    const consoleError = (globalThis as unknown as Record<string, unknown>).console.error
    const manager = await createManager(dom)

    expect(consoleError).toHaveBeenCalled()
    expect(h.physicsSetup).not.toHaveBeenCalled()

    manager.destroy()
  })

  it('aborts initialization when destroyed before data arrives', async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    ;(globalThis as unknown as Record<string, unknown>).fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )

    const manager = new GraphViewManager('graph-container', 'graph-canvas')
    manager.destroy()
    resolveFetch({ ok: true, json: async () => ({ nodes: [], links: [] }) })
    await dom.flush()

    expect(h.physicsSetup).not.toHaveBeenCalled()
    expect((globalThis as unknown as Record<string, unknown>).console.error).not.toHaveBeenCalled()
  })

  it('throttles background rendering to ~30fps', async () => {
    const manager = await createManager(dom)
    runFrame(dom, 1000)
    expect(h.renderGraph).toHaveBeenCalledTimes(1)

    // A transform update schedules the next frame
    const onTransform = h.interactionSetup.mock.calls[0][6]
    onTransform({ k: 2, x: 0, y: 0 })

    h.renderGraph.mockClear()
    // 10ms after the last draw: skipped and rescheduled
    runFrame(dom, 1010)
    expect(h.renderGraph).not.toHaveBeenCalled()
    expect(dom.rafCallbacks.length).toBe(1)

    // 50ms after the last draw: goes through
    runFrame(dom, 1060)
    expect(h.renderGraph).toHaveBeenCalledTimes(1)

    manager.destroy()
  })

  it('tears everything down on destroy', async () => {
    const manager = await createManager(dom)

    manager.destroy()

    expect(h.interactionCleanup).toHaveBeenCalled()
    expect(h.physicsDestroy).toHaveBeenCalled()
    expect((globalThis as unknown as Record<string, unknown>).cancelAnimationFrame).toHaveBeenCalled()
    // Destroy is idempotent
    expect(() => manager.destroy()).not.toThrow()
  })
})
