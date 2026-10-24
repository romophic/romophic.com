import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupInteraction, EMPTY_SET } from './interaction'
import type { PhysicsController } from './physics'
import type { D3GraphNode, D3GraphLink } from '@/types'

// Capture the handlers d3-drag/d3-zoom register through our fake selection.
const h = vi.hoisted(() => ({
  dragSubject: null as ((event: { x: number; y: number }) => unknown) | null,
  dragHandlers: {} as Record<string, (event: Record<string, unknown>) => void>,
  zoomHandler: null as ((event: { transform: unknown }) => void) | null,
  selectionCalls: [] as unknown[][],
  onValues: [] as unknown[],
}))

vi.mock('d3-drag', () => ({
  drag: () => ({
    subject(fn: (event: { x: number; y: number }) => unknown) {
      h.dragSubject = fn
      return this
    },
    on(name: string, fn: (event: Record<string, unknown>) => void) {
      h.dragHandlers[name] = fn
      return this
    },
  }),
}))

vi.mock('d3-zoom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('d3-zoom')>()
  return {
    ...actual,
    zoom: () => ({
      scaleExtent() {
        return this
      },
      on(name: string, fn: (event: { transform: unknown }) => void) {
        if (name === 'zoom') h.zoomHandler = fn
        return this
      },
    }),
  }
})

vi.mock('d3-selection', () => ({
  select: () => ({
    call(handlerish: unknown, ...args: unknown[]) {
      h.selectionCalls.push([handlerish, ...args])
      return this
    },
    on(_name: string, value: unknown) {
      h.onValues.push(value)
      return this
    },
  }),
}))

function makeNode(overrides: Partial<D3GraphNode> = {}): D3GraphNode {
  return { id: 'a', name: 'A', group: 'post', val: 2, ...overrides }
}

// With the default initial transform for width=400/height=300
// (translate(-200,-150) scale 2), pointer (200,150) maps to world (200,150).
const NODE = makeNode({ id: 'a', x: 200, y: 150 })
const OTHER = makeNode({ id: 'b', name: 'B', x: 900, y: 900 })

const LINKS: D3GraphLink[] = [
  { source: 'a', target: 'b' },
  { source: { id: 'b' }, target: 'a' },
]

function makeCanvas() {
  const listeners = new Map<string, (e: Record<string, unknown>) => void>()
  return {
    listeners,
    addEventListener: vi.fn((type: string, fn: (e: Record<string, unknown>) => void) =>
      listeners.set(type, fn),
    ),
    removeEventListener: vi.fn((type: string) => listeners.delete(type)),
    style: {} as Record<string, string>,
  }
}

function makePhysics() {
  return {
    controlSimulation: vi.fn(),
    updateNode: vi.fn(),
  }
}

beforeEach(() => {
  h.dragSubject = null
  h.dragHandlers = {}
  h.zoomHandler = null
  h.selectionCalls = []
  h.onValues = []
})

describe('setupInteraction (Test as Documentation)', () => {
  it('exports the shared empty neighbor set', () => {
    expect(EMPTY_SET.size).toBe(0)
  })

  it('applies the centered x2 initial transform directly when interaction is limited', () => {
    const canvas = makeCanvas()
    const onTransform = vi.fn()

    const { getInitialTransform } = setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [NODE],
      [],
      null,
      400,
      300,
      onTransform,
      vi.fn(),
      vi.fn(),
      false,
    )

    expect(onTransform).toHaveBeenCalledTimes(1)
    const t = onTransform.mock.calls[0][0]
    expect(t.k).toBe(2)
    // Centers the x2 viewport: (400 - 800) / 2, (300 - 600) / 2
    expect(t.x).toBe(-200)
    expect(t.y).toBe(-150)
    expect(getInitialTransform().k).toBe(2)
    expect(h.selectionCalls).toHaveLength(0)
  })

  it('registers drag before zoom in full interaction mode', () => {
    const canvas = makeCanvas()

    setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [NODE],
      LINKS,
      makePhysics(),
      400,
      300,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    )

    // drag handler first, then zoom handler, then the initial transform call
    expect(h.selectionCalls).toHaveLength(3)
  })

  it('highlights the hovered node with its neighbors and updates the cursor', () => {
    const canvas = makeCanvas()
    const onHover = vi.fn()

    setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [NODE, OTHER],
      LINKS,
      null,
      400,
      300,
      vi.fn(),
      onHover,
      vi.fn(),
      false,
    )

    canvas.listeners.get('mousemove')!({ offsetX: 200, offsetY: 150 })
    expect(onHover).toHaveBeenCalledTimes(1)
    const [hovered, neighbors] = onHover.mock.calls[0]
    expect((hovered as D3GraphNode).id).toBe('a')
    // Both link directions and object-ref links resolve to the same neighbor
    expect(neighbors as Set<string>).toEqual(new Set(['b']))
    expect(canvas.style.cursor).toBe('pointer')

    // Same node again: no duplicate callback
    canvas.listeners.get('mousemove')!({ offsetX: 200, offsetY: 150 })
    expect(onHover).toHaveBeenCalledTimes(1)

    // Moving off every node reports null with the empty set
    canvas.listeners.get('mousemove')!({ offsetX: 5, offsetY: 5 })
    expect(onHover).toHaveBeenCalledTimes(2)
    expect(onHover.mock.calls[1][0]).toBeNull()
    expect(onHover.mock.calls[1][1]).toBe(EMPTY_SET)
    expect(canvas.style.cursor).toBe('default')
  })

  it('clicks route the hovered node and ignore clicks in empty space', () => {
    const canvas = makeCanvas()
    const onClick = vi.fn()

    setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [NODE],
      [],
      null,
      400,
      300,
      vi.fn(),
      vi.fn(),
      onClick,
      false,
    )

    canvas.listeners.get('click')!({})
    expect(onClick).not.toHaveBeenCalled()

    canvas.listeners.get('mousemove')!({ offsetX: 200, offsetY: 150 })
    canvas.listeners.get('click')!({})
    expect(onClick).toHaveBeenCalledWith(NODE)
  })

  it('runs the drag lifecycle against the physics controller', () => {
    const canvas = makeCanvas()
    const physics = makePhysics()
    const dragged = makeNode({ id: 'a', x: 200, y: 150 })

    setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [dragged],
      [],
      physics as unknown as PhysicsController,
      400,
      300,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    )

    // Zoom event installs the transform drag inverts through
    h.zoomHandler!({ transform: { invertX: (x: number) => x, invertY: (y: number) => y, k: 1 } })

    expect(h.dragSubject).toBeTruthy()
    expect(h.dragSubject!({ x: 200, y: 150 })).toBe(dragged)
    expect(h.dragSubject!({ x: 5, y: 5 })).toBeNull()

    h.dragHandlers['start']({ active: 0, subject: dragged })
    expect(physics.controlSimulation).toHaveBeenCalledWith(0.3, true)
    expect(dragged.fx).toBe(200)
    expect(physics.updateNode).toHaveBeenCalledWith('a', 200, 150)

    h.dragHandlers['drag']({
      subject: dragged,
      sourceEvent: { offsetX: 260, offsetY: 150 },
    })
    expect(dragged.fx).toBe(260)
    expect(physics.updateNode).toHaveBeenCalledWith('a', 260, 150)

    h.dragHandlers['end']({ active: 0, subject: dragged })
    expect(physics.controlSimulation).toHaveBeenCalledWith(0)
    expect(dragged.fx).toBeNull()
    expect(physics.updateNode).toHaveBeenCalledWith('a', null, null)
  })

  it('skips simulation control while other gestures are active and without a controller', () => {
    const canvas = makeCanvas()
    const physics = makePhysics()
    const dragged = makeNode({ id: 'a', x: 200, y: 150 })

    setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [dragged],
      [],
      physics as unknown as PhysicsController,
      400,
      300,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    )

    // active !== 0 means another gesture owns the simulation
    h.dragHandlers['start']({ active: 1, subject: dragged })
    expect(physics.controlSimulation).not.toHaveBeenCalled()

    // No controller at all: lifecycle still runs without throwing
    const bare = makeNode({ id: 'b', x: 1, y: 1 })
    const canvas2 = makeCanvas()
    setupInteraction(
      canvas2 as unknown as HTMLCanvasElement,
      [bare],
      [],
      null,
      400,
      300,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    )
    expect(() =>
      h.dragHandlers['end']({ active: 0, subject: bare }),
    ).not.toThrow()
  })

  it('forwards zoom transforms to the transform callback', () => {
    const canvas = makeCanvas()
    const onTransform = vi.fn()
    const transform = { k: 3, x: 1, y: 2 }

    setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [NODE],
      [],
      null,
      400,
      300,
      onTransform,
      vi.fn(),
      vi.fn(),
    )

    h.zoomHandler!({ transform })
    expect(onTransform).toHaveBeenCalledWith(transform)
  })

  it('cleanup removes listeners and d3 bindings', () => {
    const canvas = makeCanvas()

    const { cleanup } = setupInteraction(
      canvas as unknown as HTMLCanvasElement,
      [NODE],
      [],
      null,
      400,
      300,
      vi.fn(),
      vi.fn(),
      vi.fn(),
    )

    cleanup()

    expect(canvas.removeEventListener).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    )
    expect(canvas.removeEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    )
    expect(h.onValues).toEqual([null, null])
  })
})
