import { type Ref, unref, ref } from 'vue'
import { type VueFlowStore, type NodeChange } from '@vue-flow/core'

/**
 * Minimal interface for VueFlow instance required for navigation.
 */
export interface CanvasNavigationInstance {
  fitView: VueFlowStore['fitView']
  findNode: VueFlowStore['findNode']
  onNodesChange: VueFlowStore['onNodesChange']
}

/**
 * Composable for handling canvas navigation actions.
 *
 * @param vueFlowInstance VueFlow instance or ref to it
 */
export function useCanvasNavigation(
  vueFlowInstance: CanvasNavigationInstance | Ref<CanvasNavigationInstance | undefined> | undefined
) {
  const pendingNavigationNodeId = ref<string | null>(null)

  const instance = unref(vueFlowInstance)

  if (instance) {
    instance.onNodesChange((changes: NodeChange[]) => {
      if (!pendingNavigationNodeId.value) return

      const hasRelevantChange = changes.some((c) => {
        let changeId: string | undefined
        if (c.type === 'dimensions') {
          changeId = c.id
        }

        return changeId === pendingNavigationNodeId.value
      })

      if (hasRelevantChange) {
        navigateToNode(pendingNavigationNodeId.value)
        pendingNavigationNodeId.value = null
      }
    })
  }

  /**
   * Navigates to a specific node by centering it in the viewport.
   * Assumes the node is already available in VueFlow's store.
   * Includes smooth animation and appropriate padding.
   *
   * @param nodeId ID of the node to navigate to
   */
  function navigateToNode(nodeId: string) {
    const inst = unref(vueFlowInstance)
    if (!inst) {
      return
    }

    inst.fitView({
      nodes: [nodeId],
      padding: 0.3,
      duration: 600,
    })
  }

  /**
   * Sets a node to be navigated to as soon as it is added to the graph and measured.
   *
   * @param nodeId ID of the node to navigate to when it becomes available
   */
  function navigateToNewNode(nodeId: string) {
    pendingNavigationNodeId.value = nodeId
  }

  return {
    navigateToNewNode,
  }
}
