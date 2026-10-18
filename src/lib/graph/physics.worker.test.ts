import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { sim } = vi.hoisted(() => {
  const sim = {
    force: vi.fn(),
    on: vi.fn(),
    alphaTarget: vi.fn(),
    restart: vi.fn(),
    stop: vi.fn(),
    alpha: vi.fn(),
  }
  sim.force.mockReturnThis()
  sim.on.mockReturnThis()
  sim.alphaTarget.mockReturnThis()
  sim.restart.mockReturnThis()
  sim.stop.mockReturnThis()
  sim.alpha.mockReturnThis()
  return { sim }
})

vi.mock('d3-force', () => {
  const makeForce = (): Record<string, () => unknown> => {
    const force: Record<string, () => unknown> = {}
    for (const method of ['id', 'distance', 'strength', 'radius', 'x', 'y']) {
      force[method] = () => force
    }
    return force
  }
  return {
    forceSimulation: () => sim,
    forceLink: () => makeForce(),
    forceManyBody: () => makeForce(),
    forceCenter: () => makeForce(),
    forceX: () => makeForce(),
    forceY: () => makeForce(),
    forceCollide: () => makeForce(),
  }
})

describe('physics worker run-state (Test as Documentation)', () => {
  let fakeSelf: {
    onmessage: ((event: MessageEvent) => void) | null
    postMessage: ReturnType<typeof vi.fn>
    close: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    fakeSelf = { onmessage: null, postMessage: vi.fn(), close: vi.fn() }
    vi.stubGlobal('self', fakeSelf)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  async function initWorker(reducedMotion: boolean) {
    await import('./physics.worker')
    fakeSelf.onmessage?.({
      data: {
        type: 'INIT',
        payload: {
          nodes: [],
          links: [],
          width: 800,
          height: 600,
          reducedMotion,
        },
      },
    } as MessageEvent)
  }

  it('keeps the idle simulation warm so the rotating layout keeps moving', async () => {
    await initWorker(false)

    expect(sim.alphaTarget).toHaveBeenCalledWith(0.02)
  })

  it('lets the simulation settle to a full stop when reduced motion is preferred', async () => {
    await initWorker(true)

    expect(sim.alphaTarget).toHaveBeenCalledWith(0)
    expect(sim.alphaTarget).not.toHaveBeenCalledWith(0.02)
  })

  it('stops ticking while the tab is hidden and settles again on return under reduced motion', async () => {
    await initWorker(true)

    fakeSelf.onmessage?.({
      data: { type: 'SET_VISIBLE', payload: { visible: false } },
    } as MessageEvent)
    expect(sim.stop).toHaveBeenCalled()

    sim.alphaTarget.mockClear()
    fakeSelf.onmessage?.({
      data: { type: 'SET_VISIBLE', payload: { visible: true } },
    } as MessageEvent)
    expect(sim.alphaTarget).toHaveBeenCalledWith(0)
  })

  it('re-heats the idle rotation when the tab becomes visible again', async () => {
    await initWorker(false)

    fakeSelf.onmessage?.({
      data: { type: 'SET_VISIBLE', payload: { visible: false } },
    } as MessageEvent)
    expect(sim.stop).toHaveBeenCalled()

    sim.alphaTarget.mockClear()
    fakeSelf.onmessage?.({
      data: { type: 'SET_VISIBLE', payload: { visible: true } },
    } as MessageEvent)
    expect(sim.alphaTarget).toHaveBeenCalledWith(0.02)
  })

  it('cools the simulation while the user interacts regardless of motion preference', async () => {
    await initWorker(false)

    sim.alphaTarget.mockClear()
    fakeSelf.onmessage?.({
      data: { type: 'SET_INTERACTIVE', payload: { isInteractive: true } },
    } as MessageEvent)
    expect(sim.alphaTarget).toHaveBeenCalledWith(0)
  })
})
