import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useLayout } from './useLayout'
import {
  createCanvasEdge,
  createCanvasNode,
  createTrack,
  createTracksViewModel,
} from './__testHelpers__/builders'

describe('useLayout', () => {
  it('maps CanvasNodes to Vue Flow nodes with correct data and status', async () => {
    const tracksData = ref(
      createTracksViewModel({
        tracks: [
          createTrack({
            nodes: [createCanvasNode({ id: 'n1', type: 'plainText' })],
          }),
        ],
        edges: [createCanvasEdge({ id: 'e1', source: 'n1', target: 'n2' })],
      })
    )

    const dimensions = ref(new Map([['n1', { w: 100, h: 50 }]]))

    const { nodes, edges, isLayoutRunning } = useLayout(tracksData, dimensions)

    await vi.waitUntil(() => nodes.value.length > 0)

    const resultNode = nodes.value[0]!

    expect(resultNode.id).toBe('n1')
    expect(resultNode.type).toBe('plainText')
    expect(resultNode.data).toMatchObject({ id: 'n1' })

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

    const { nodes } = useLayout(data, dims)

    await vi.waitUntil(() => nodes.value.length > 0)
    expect(nodes.value[0]!.width).toBe(100)

    dims.value = new Map([['n1', { w: 500, h: 50 }]])

    await vi.waitUntil(() => nodes.value[0]?.width === 500)
    expect(nodes.value[0]!.width).toBe(500)
  })
})
