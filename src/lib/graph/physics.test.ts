import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupPhysics } from './physics'

describe('physics (Test as Documentation)', () => {
  let mockWorkerInstance: {
    onmessage: ((event: MessageEvent) => void) | null
    postMessage: ReturnType<typeof vi.fn>
    terminate: ReturnType<typeof vi.fn>
  }
  let originalWorker: typeof Worker

  beforeEach(() => {
    originalWorker = globalThis.Worker
    mockWorkerInstance = {
      onmessage: null,
      postMessage: vi.fn(),
      terminate: vi.fn(),
    }
    globalThis.Worker = vi
      .fn()
      .mockImplementation(() => mockWorkerInstance) as unknown as typeof Worker
  })

  afterEach(() => {
    globalThis.Worker = originalWorker
  })

  it('initializes physics worker and sends control messages', () => {
    const onTick = vi.fn()
    const controller = setupPhysics([], [], 800, 600, onTick)

    expect(globalThis.Worker).toHaveBeenCalled()
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'INIT',
      payload: { nodes: [], links: [], width: 800, height: 600 },
    })

    controller.setInteractive(true)
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'SET_INTERACTIVE',
      payload: { isInteractive: true },
    })

    controller.updateNode('node-1', 100, 200)
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'UPDATE_NODE',
      payload: { id: 'node-1', fx: 100, fy: 200 },
    })

    controller.controlSimulation(0.3, true)
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'SIMULATION_CONTROL',
      payload: { alphaTarget: 0.3, restart: true },
    })

    // Simulate TICK from worker
    if (mockWorkerInstance.onmessage) {
      mockWorkerInstance.onmessage({
        data: {
          type: 'TICK',
          payload: [{ id: 'node-1', x: 10, y: 20, vx: 0, vy: 0 }],
        },
      } as MessageEvent)
    }
    expect(onTick).toHaveBeenCalledWith([
      { id: 'node-1', x: 10, y: 20, vx: 0, vy: 0 },
    ])

    controller.destroy()
    expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
      type: 'DESTROY',
    })
    expect(mockWorkerInstance.terminate).toHaveBeenCalled()
  })
})
