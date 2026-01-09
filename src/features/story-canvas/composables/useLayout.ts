import { shallowRef, ref, watch, toValue, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { type Node, type Edge } from '@vue-flow/core'
import { runProcessLayout } from '@/features/story-canvas/utils/elk'
import type {
  CanvasNode,
  TracksViewModel,
} from '@/features/story-canvas/composables/useProjectViewModel'

const GHOST_WIDTH = 400
const GHOST_HEIGHT = 150
const LAYOUT_DEBOUNCE_TIME = 50

export function useLayout(
  tracksData: Ref<TracksViewModel | undefined>,
  dimensions: Ref<Map<string, { w: number; h: number }>>
) {
  // Use shallowRef for performance—Vue Flow handles its own internal reactivity
  const nodes = shallowRef<Node<CanvasNode>[]>([])
  const edges = shallowRef<Edge[]>([])
  const isLayoutRunning = ref(false)
  const hasInitialLayout = ref(false)

  const calculateLayout = useDebounceFn(async () => {
    const data = toValue(tracksData)
    const dims = toValue(dimensions)

    if (!data || data.tracks.length === 0) return

    isLayoutRunning.value = true
    try {
      const positions = await runProcessLayout(data, dims)
      nodes.value = data.tracks.flatMap((track) =>
        track.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: positions.get(node.id) ?? { x: 0, y: 0 },
          data: node,
          width: dims.get(node.id)?.w ?? GHOST_WIDTH,
          height: dims.get(node.id)?.h ?? GHOST_HEIGHT,
        }))
      )

      edges.value = data.edges.map((e) => ({
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

  watch([tracksData, dimensions], calculateLayout, { immediate: true })

  return {
    nodes,
    edges,
    isLayoutRunning,
    hasInitialLayout,
  }
}
