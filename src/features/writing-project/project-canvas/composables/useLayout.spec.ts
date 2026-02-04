import { describe, expect, vi, beforeAll } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { ref } from 'vue'
import { useLayout } from './useLayout'
import {
  buildCanvasEdge,
  buildBasicCanvasNode,
  buildTrack,
  buildCanvasViewModel,
} from '../__testHelpers__/builders'

describe('useLayout', () => {
  beforeAll(async () => {
    // Preload elkjs for tests to avoid dynamic import timeouts
    await import('elkjs/lib/elk.bundled.js')
  })

  it('maps CanvasNodes to Vue Flow nodes with correct data and status', async () => {
    const tracksData = buildCanvasViewModel({
      tracks: [
        buildTrack({
          nodes: [buildBasicCanvasNode({ id: 'n1' })],
        }),
      ],
      edges: [buildCanvasEdge({ id: 'e1', source: 'n1', target: 'n2' })],
    })

    const tracks = ref(tracksData.tracks)
    const edgesRef = ref(tracksData.edges)
    const dimensions = ref(new Map([['n1', { w: 100, h: 50 }]]))

    const { layoutNodes, edges, isLayoutRunning } = useLayout(tracks, edgesRef, dimensions)

    await vi.waitUntil(() => layoutNodes.value.length > 0)

    const resultNode = layoutNodes.value[0]!

    expect(resultNode.id).toBe('n1')

    expect(edges.value[0]).toMatchObject({
      id: 'e1',
      type: 'smoothstep',
    })

    expect(isLayoutRunning.value).toBe(false)
  })

  it('updates the layout when dimensions change', async () => {
    const dims = ref(new Map([['n1', { w: 100, h: 50 }]]))
    const data = buildCanvasViewModel({
      tracks: [buildTrack({ nodes: [buildBasicCanvasNode({ id: 'n1' })] })],
    })

    const tracks = ref(data.tracks)
    const edgesRef = ref(data.edges)

    const { layoutNodes } = useLayout(tracks, edgesRef, dims)

    await vi.waitUntil(() => layoutNodes.value.length > 0)
    expect(layoutNodes.value[0]!.width).toBe(100)

    dims.value = new Map([['n1', { w: 500, h: 50 }]])

    await vi.waitUntil(() => layoutNodes.value[0]?.width === 500)
    expect(layoutNodes.value[0]!.width).toBe(500)
  })

  it('does not update layout when only metadata changes', async () => {
    const initialNode = buildBasicCanvasNode({ id: 'n1' })
    const tracksData = buildCanvasViewModel({
      tracks: [buildTrack({ nodes: [initialNode] })],
    })
    const tracks = ref(tracksData.tracks)
    const edgesRef = ref(tracksData.edges)
    const dimensions = ref(new Map([['n1', { w: 100, h: 50 }]]))

    const { layoutNodes } = useLayout(tracks, edgesRef, dimensions)

    await vi.waitUntil(() => layoutNodes.value.length > 0)
    const initialPosition = { ...layoutNodes.value[0]!.position }

    // Change only metadata (label) - actually in this simplified track model,
    // metadata is separate, but we want to test if changing things that don't affect topology
    // (like sortOrder? no, sortOrder affects topology).
    // Let's change the node category, which is in the node but doesn't affect topology.
    tracks.value = [
      buildTrack({
        nodes: [{ ...initialNode, category: 'character' }],
      }),
    ]

    // Wait a bit to ensure debounce/watcher would have fired
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(layoutNodes.value[0]!.position).toEqual(initialPosition)
  })
})
