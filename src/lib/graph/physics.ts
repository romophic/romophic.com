import type { D3GraphLink, D3GraphNode } from '@/types'

export interface PhysicsController {
  setInteractive: (val: boolean) => void
  updateNode: (id: string, fx: number | null, fy: number | null) => void
  controlSimulation: (alphaTarget?: number, restart?: boolean) => void
  destroy: () => void
}

export function setupPhysics(
  nodes: D3GraphNode[],
  links: D3GraphLink[],
  width: number,
  height: number,
  onTick: (
    updatedNodes: {
      id: string
      x: number
      y: number
      vx: number
      vy: number
    }[],
  ) => void,
): PhysicsController {
  const worker = new Worker(new URL('./physics.worker.ts', import.meta.url), {
    type: 'module',
  })

  worker.onmessage = (event) => {
    if (event.data.type === 'TICK') {
      onTick(event.data.payload)
    }
  }

  worker.postMessage({
    type: 'INIT',
    payload: { nodes, links, width, height },
  })

  return {
    setInteractive: (isInteractive: boolean) => {
      worker.postMessage({
        type: 'SET_INTERACTIVE',
        payload: { isInteractive },
      })
    },
    updateNode: (id: string, fx: number | null, fy: number | null) => {
      worker.postMessage({ type: 'UPDATE_NODE', payload: { id, fx, fy } })
    },
    controlSimulation: (alphaTarget?: number, restart?: boolean) => {
      worker.postMessage({
        type: 'SIMULATION_CONTROL',
        payload: { alphaTarget, restart },
      })
    },
    destroy: () => {
      worker.postMessage({ type: 'DESTROY' })
      worker.terminate()
    },
  }
}
