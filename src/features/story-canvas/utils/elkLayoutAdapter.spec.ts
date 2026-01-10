import { describe, it, expect } from 'vitest'
import { calculateTrackedLayout } from '@/features/story-canvas/utils/elkLayoutAdapter'
import {
  createCanvasNode,
  createTrack,
} from '../composables/__testHelpers__/builders'
import type { CanvasEdge } from '../composables/useProjectViewModel'

describe('elkLayoutAdapter', () => {
  describe('calculateTrackedLayout', () => {
    it('aligns nodes vertically when they share the same global stage', async () => {
      const dimensions = new Map([
        ['node-track1', { w: 100, h: 200 }],
        ['node-track2', { w: 100, h: 100 }],
      ])
      const edges: CanvasEdge[] = []
      const tracks = [
        createTrack({ nodes: [createCanvasNode({ id: 'node-track1', stage: 0 })] }),
        createTrack({ nodes: [createCanvasNode({ id: 'node-track2', stage: 0 })] }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, dimensions)

      expect(result.get('node-track1')!.y).toBe(result.get('node-track2')!.y)
    })

    it('respects sortOrder for horizontal positioning within a track', async () => {
      const edges: CanvasEdge[] = []
      const tracks = [
        createTrack({ nodes: [createCanvasNode({ id: 'step-B', stage: 0, sortOrder: 1 }), createCanvasNode({ id: 'step-A', stage: 0, sortOrder: 0 })] }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, new Map())

      expect(result.get('step-A')!.x).toBeLessThan(result.get('step-B')!.x)
    })

    it('places the second track to the right of the first track', async () => {
      const edges: CanvasEdge[] = []
      const tracks = [
        createTrack({ nodes: [createCanvasNode({ id: 'n1', stage: 0, sortOrder: 0 })] }),
        createTrack({ nodes: [createCanvasNode({ id: 'n2', stage: 0, sortOrder: 0 })] }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, new Map())

      const track1Node = result.get('n1')!
      const track2Node = result.get('n2')!

      expect(track2Node.x).toBeGreaterThan(track1Node.x)
    })

    it('anchors disconnected nodes to their assigned stage depth using hidden bridges', async () => {
      const dimensions = new Map([
        ['node-0', { w: 100, h: 100 }],
        ['node-3', { w: 100, h: 100 }],
      ])

      const edges: CanvasEdge[] = []
      const tracks = [
        createTrack({ nodes: [createCanvasNode({ id: 'node-0', stage: 0, sortOrder: 0 })] }),
        createTrack({ nodes: [createCanvasNode({ id: 'node-3', stage: 3, sortOrder: 0 })] }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, dimensions)

      const pos0 = result.get('node-0')!
      const pos3 = result.get('node-3')!

      expect(pos3.y).toBeGreaterThan(pos0.y)
    })

    it('applies the track offset to shift nodes vertically', async () => {
      const dimensions = new Map([['node-a', { w: 100, h: 100 }]])

      const edges: CanvasEdge[] = []
      const tracks = [
        createTrack({ offset: 0, nodes: [createCanvasNode({ id: 'node-a', stage: 0, sortOrder: 0 })] }),
        createTrack({ offset: 2, nodes: [createCanvasNode({ id: 'node-b', stage: 0, sortOrder: 0 })] }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, dimensions)

      expect(result.get('node-b')!.y).toBeGreaterThan(result.get('node-a')!.y)
    })
  })
})
