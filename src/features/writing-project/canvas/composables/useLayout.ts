import { shallowRef, ref, watch, toValue, type Ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { type Edge } from '@vue-flow/core'
import { calculateTrackedLayout } from '@/features/writing-project/canvas/utils/elkLayoutAdapter'
import type { Track, CanvasEdge } from '../types'

const GHOST_WIDTH = 400
const GHOST_HEIGHT = 150
const LAYOUT_DEBOUNCE_TIME = 50

/**
 * Computes a signature representing the graph topology (nodes, edges, track assignments).
 * Changes to this signature trigger a full layout recalculation.
 * Content changes (text edits) do NOT affect this signature.
 */
function computeTopologySignature(tracks: Track[], edges: CanvasEdge[]): string {
  return JSON.stringify({
    nodes: tracks.flatMap((t) => t.nodes.map((n) => n.id)).sort(),
    edges: edges.map((e) => e.id).sort(),
    tracks: tracks.map((t) => ({ id: t.id, nodes: t.nodes.map((n) => n.id) })),
  })
}

export interface LayoutNode {
  id: string
  position: { x: number; y: number }
  width: number
  height: number
}

export function useLayout(
  tracks: Ref<Track[]>,
  edges: Ref<CanvasEdge[]>,
  dimensions: Ref<Map<string, { w: number; h: number }>>
) {
  const layoutNodes = shallowRef<LayoutNode[]>([])
  const laidOutEdges = shallowRef<Edge[]>([])
  const isLayoutRunning = ref(false)
  const hasInitialLayout = ref(false)

  const calculateLayout = useDebounceFn(async () => {
    const currentTracks = toValue(tracks)
    const currentEdges = toValue(edges)
    const dims = toValue(dimensions)

    if (currentTracks.length === 0) {
      hasInitialLayout.value = true
      return
    }

    isLayoutRunning.value = true
    try {
      const positions = await calculateTrackedLayout(currentTracks, currentEdges, dims)
      layoutNodes.value = currentTracks.flatMap((track) =>
        track.nodes.map((node) => ({
          id: node.id,
          position: positions.get(node.id) ?? { x: 0, y: 0 },
          width: dims.get(node.id)?.w ?? GHOST_WIDTH,
          height: dims.get(node.id)?.h ?? GHOST_HEIGHT,
        }))
      )

      laidOutEdges.value = currentEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
      }))
      if (!hasInitialLayout.value) {
        hasInitialLayout.value = true
      }
    } catch (err) {
      console.error('Track Layout calculation failed', err)
    } finally {
      isLayoutRunning.value = false
    }
  }, LAYOUT_DEBOUNCE_TIME)

  const topologySignature = computed(() =>
    computeTopologySignature(toValue(tracks), toValue(edges))
  )
  watch([topologySignature, dimensions], () => calculateLayout(), {
    immediate: true,
  })

  return {
    layoutNodes,
    edges: laidOutEdges,
    isLayoutRunning,
    hasInitialLayout,
  }
}
