import { shallowRef, ref, watch, toValue, type Ref } from 'vue'
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

export function useLayout(
  tracksData: Ref<TracksViewModel>,
  dimensions: Ref<Map<string, { w: number; h: number }>>
) {
  // Use shallowRef for performance—Vue Flow handles its own internal reactivity
  const laidOutNodes = shallowRef<Node<CanvasNode>[]>([])
  const laidOutEdges = shallowRef<Edge[]>([])
  const isLayoutRunning = ref(false)
  const hasInitialLayout = ref(false)

  const calculateLayout = useDebounceFn(async () => {
    const { tracks, edges } = toValue(tracksData)
    const dims = toValue(dimensions)

    if (tracks.length === 0) return

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
      hasInitialLayout.value = true
    } catch (err) {
      console.error('Track Layout calculation failed', err)
    } finally {
      isLayoutRunning.value = false
    }
  }, LAYOUT_DEBOUNCE_TIME)

  watch([() => toValue(tracksData), () => toValue(dimensions)], () => calculateLayout(), {
    immediate: true,
  })

  return {
    nodes: laidOutNodes,
    edges: laidOutEdges,
    isLayoutRunning,
    hasInitialLayout,
  }
}
