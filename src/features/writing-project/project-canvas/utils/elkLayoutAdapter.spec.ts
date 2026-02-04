import { describe, expect } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { calculateTrackedLayout } from '@/features/writing-project/project-canvas/utils/elkLayoutAdapter'
import { buildBasicCanvasNode, buildTrack } from '../__testHelpers__/builders'
import type { CanvasEdge } from '../types'

describe('elkLayoutAdapter', () => {
  describe('calculateTrackedLayout', () => {
    it('aligns nodes vertically when they share the same global stage', async () => {
      const dimensions = new Map([
        ['node-track1', { w: 100, h: 200 }],
        ['node-track2', { w: 100, h: 100 }],
      ])
      const edges: CanvasEdge[] = []
      const tracks = [
        buildTrack({ nodes: [buildBasicCanvasNode({ id: 'node-track1', stage: 0 })] }),
        buildTrack({ nodes: [buildBasicCanvasNode({ id: 'node-track2', stage: 0 })] }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, dimensions)

      expect(result.get('node-track1')!.y).toBe(result.get('node-track2')!.y)
    })

    it('respects sortOrder for horizontal positioning within a track', async () => {
      const edges: CanvasEdge[] = []
      const tracks = [
        buildTrack({
          nodes: [
            buildBasicCanvasNode({ id: 'step-B', stage: 0, sortOrder: 1 }),
            buildBasicCanvasNode({ id: 'step-A', stage: 0, sortOrder: 0 }),
          ],
        }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, new Map())

      expect(result.get('step-A')!.x).toBeLessThan(result.get('step-B')!.x)
    })

    it('places the second track to the right of the first track', async () => {
      const edges: CanvasEdge[] = []
      const tracks = [
        buildTrack({ nodes: [buildBasicCanvasNode({ id: 'n1', stage: 0, sortOrder: 0 })] }),
        buildTrack({ nodes: [buildBasicCanvasNode({ id: 'n2', stage: 0, sortOrder: 0 })] }),
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
        buildTrack({ nodes: [buildBasicCanvasNode({ id: 'node-0', stage: 0, sortOrder: 0 })] }),
        buildTrack({ nodes: [buildBasicCanvasNode({ id: 'node-3', stage: 3, sortOrder: 0 })] }),
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
        buildTrack({
          offset: 0,
          nodes: [buildBasicCanvasNode({ id: 'node-a', stage: 0, sortOrder: 0 })],
        }),
        buildTrack({
          offset: 2,
          nodes: [buildBasicCanvasNode({ id: 'node-b', stage: 0, sortOrder: 0 })],
        }),
      ]

      const result = await calculateTrackedLayout(tracks, edges, dimensions)

      expect(result.get('node-b')!.y).toBeGreaterThan(result.get('node-a')!.y)
    })
  })
})
