import { describe, it, expect, vi, beforeAll } from 'vitest'
import { ref } from 'vue'
import { useLayout } from './useLayout'
import {
  createCanvasEdge,
  createCanvasNode,
  createTrack,
  createTracksViewModel,
} from './__testHelpers__/builders'

describe('useLayout', () => {
  beforeAll(async () => {
    // Preload elkjs for tests to avoid dynamic import timeouts
    await import('elkjs/lib/elk.bundled.js')
  })

  it('maps CanvasNodes to Vue Flow nodes with correct data and status', async () => {
    const tracksData = ref(
      createTracksViewModel({
        tracks: [
          createTrack({
            nodes: [createCanvasNode({ id: 'n1' })],
          }),
        ],
        edges: [createCanvasEdge({ id: 'e1', source: 'n1', target: 'n2' })],
      })
    )

    const dimensions = ref(new Map([['n1', { w: 100, h: 50 }]]))

    const { layoutNodes, edges, isLayoutRunning } = useLayout(tracksData, dimensions)

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
    const data = ref(
      createTracksViewModel({
        tracks: [createTrack({ nodes: [createCanvasNode({ id: 'n1' })] })],
      })
    )

    const { layoutNodes } = useLayout(data, dims)

    await vi.waitUntil(() => layoutNodes.value.length > 0)
    expect(layoutNodes.value[0]!.width).toBe(100)

    dims.value = new Map([['n1', { w: 500, h: 50 }]])

    await vi.waitUntil(() => layoutNodes.value[0]?.width === 500)
    expect(layoutNodes.value[0]!.width).toBe(500)
  })

  it('does not update layout when only metadata changes', async () => {
    const initialNode = createCanvasNode({ id: 'n1' })
    const tracksData = ref(
      createTracksViewModel({
        tracks: [createTrack({ nodes: [initialNode] })],
      })
    )
    const dimensions = ref(new Map([['n1', { w: 100, h: 50 }]]))

    const { layoutNodes } = useLayout(tracksData, dimensions)

    await vi.waitUntil(() => layoutNodes.value.length > 0)
    const initialPosition = { ...layoutNodes.value[0]!.position }

    // Change only metadata (label)
    tracksData.value = createTracksViewModel({
      tracks: [
        createTrack({
          nodes: [{ ...initialNode, sortOrder: 5 }],
        }),
      ],
    })

    // Wait a bit to ensure debounce/watcher would have fired
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(layoutNodes.value[0]!.position).toEqual(initialPosition)
  })
})
