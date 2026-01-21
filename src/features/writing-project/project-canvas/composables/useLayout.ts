import { shallowRef, ref, watch, toValue, type Ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { type Edge } from '@vue-flow/core'
import { calculateTrackedLayout } from '@/features/writing-project/project-canvas/utils/elkLayoutAdapter'
import type { TracksViewModel } from '../../view-model/types'

const GHOST_WIDTH = 400
const GHOST_HEIGHT = 150
const LAYOUT_DEBOUNCE_TIME = 50

/**
 * Computes a signature representing the graph topology (nodes, edges, track assignments).
 * Changes to this signature trigger a full layout recalculation.
 * Content changes (text edits) do NOT affect this signature.
 */
function computeTopologySignature(tracksData: TracksViewModel): string {
  return JSON.stringify({
    nodes: tracksData.tracks.flatMap((t) => t.nodes.map((n) => n.id)).sort(),
    edges: tracksData.edges.map((e) => e.id).sort(),
    tracks: tracksData.tracks.map((t) => ({ id: t.id, nodes: t.nodes.map((n) => n.id) })),
  })
}

export interface LayoutNode {
  id: string
  position: { x: number; y: number }
  width: number
  height: number
}

export function useLayout(
  tracksData: Ref<TracksViewModel>,
  dimensions: Ref<Map<string, { w: number; h: number }>>
) {
  const layoutNodes = shallowRef<LayoutNode[]>([])
  const laidOutEdges = shallowRef<Edge[]>([])
  const isLayoutRunning = ref(false)
  const hasInitialLayout = ref(false)

  const calculateLayout = useDebounceFn(async () => {
    const { tracks, edges } = toValue(tracksData)
    const dims = toValue(dimensions)

    if (tracks.length === 0) {
      hasInitialLayout.value = true
      return
    }

    isLayoutRunning.value = true
    try {
      const positions = await calculateTrackedLayout(tracks, edges, dims)
      layoutNodes.value = tracks.flatMap((track) =>
        track.nodes.map((node) => ({
          id: node.id,
          position: positions.get(node.id) ?? { x: 0, y: 0 },
          width: dims.get(node.id)?.w ?? GHOST_WIDTH,
          height: dims.get(node.id)?.h ?? GHOST_HEIGHT,
        }))
      )

      laidOutEdges.value = edges.map((e) => ({
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

  const topologySignature = computed(() => computeTopologySignature(toValue(tracksData)))
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
