import { shallowRef, ref, watch, toValue, type Ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { type Node, type Edge } from '@vue-flow/core'
import { calculateTrackedLayout } from '@/features/story-canvas/utils/elkLayoutAdapter'
import type {
  CanvasNode,
  TracksViewModel,
} from '@/features/story-canvas/composables/useProjectViewModel'

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

/**
 * Updates node data without changing positions.
 * Used to sync content changes without triggering expensive layout recalculation.
 */
function syncNodeData(
  currentNodes: Node<CanvasNode>[],
  newTracksData: TracksViewModel
): Node<CanvasNode>[] {
  return currentNodes.map((node) => {
    const foundNode = newTracksData.tracks.flatMap((t) => t.nodes).find((n) => n.id === node.id)

    return foundNode ? { ...node, data: foundNode } : node
  })
}

export function useLayout(
  tracksData: Ref<TracksViewModel>,
  dimensions: Ref<Map<string, { w: number; h: number }>>
) {
  const laidOutNodes = shallowRef<Node<CanvasNode>[]>([])
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
      laidOutNodes.value = tracks.flatMap((track) =>
        track.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: positions.get(node.id) ?? { x: 0, y: 0 },
          data: node,
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

  watch(
    tracksData,
    (newData) => {
      laidOutNodes.value = syncNodeData(laidOutNodes.value, newData)
    },
    { deep: true }
  )

  return {
    nodes: laidOutNodes,
    edges: laidOutEdges,
    isLayoutRunning,
    hasInitialLayout,
  }
}
