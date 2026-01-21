<template>
  <div class="grow relative bg-background" :aria-busy="isLoading">
    <CanvasLayoutIndicator :is-loading="isLayoutRunning && hasInitialLayout" />

    <AppLoadingOverlay
      :is-loading="!hasInitialLayout"
      message="Loading project..."
      aria-label="Opening project"
    />

    <EmptyCanvas v-if="hasInitialLayout && nodes.length === 0" />

    <VueFlow
      v-if="nodes.length > 0"
      :nodes="nodes"
      :edges="edges"
      :apply-default="false"
      :class="{ 'opacity-0': !hasInitialLayout }"
      :fit-view-on-init="true"
    >
      <template #node-richText="{ id, data }">
        <CanvasStep
          :id="data.id"
          :ref="(el: any) => registerNode(id, el?.$el || el)"
          :definition="data.definition"
          :content="data.content"
          :actions="data.actions"
          @update:content="handleContentUpdate"
          @action-click="handleActionClick"
        />
      </template>
      <template #node-plainText="{ id, data }">
        <CanvasStep
          :id="data.id"
          :ref="(el: any) => registerNode(id, el?.$el || el)"
          :definition="data.definition"
          :content="data.content"
          :actions="data.actions"
          @update:content="handleContentUpdate"
          @action-click="handleActionClick"
        />
      </template>
      <Background />
      <Controls class="border border-edge bg-paper fill-ink" />
      <MiniMap class="border border-edge bg-paper" />
    </VueFlow>
  </div>
</template>
<script setup lang="ts">
import { toRef, computed } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useLayout } from '@/features/writing-project/project-canvas/composables/useLayout'
import { useCanvasNavigation } from '@/features/writing-project/project-canvas/composables/useCanvasNavigation'
import { useNodeSizeObserver } from '@/features/writing-project/project-canvas/composables/useNodeSizeObserver'
import type { ActionDefinition } from '@/features/writing-project/view-model/useStepActions'
import type {
  CanvasStepDefinition,
  CanvasStepContent,
} from '@/features/writing-project/project-canvas/stepTypes'
import CanvasStep from '@/features/writing-project/project-canvas/canvas-step/CanvasStep.vue'
import EmptyCanvas from '@/features/writing-project/project-canvas/EmptyCanvas.vue'
import CanvasLayoutIndicator from '@/features/writing-project/project-canvas/CanvasLayoutIndicator.vue'
import type { ViewModel } from '../view-model/types'
import { useCanvasViewModel } from './composables/useCanvasViewModel'
import { useStepActions } from '../view-model/useStepActions'
import { useProjectContent } from '../view-model/useProjectContext'
import { useDefinitionsContext } from '../view-model/useDefinitionsContext'

const props = defineProps<{
  viewModel: ViewModel
}>()

const { template, strings } = useDefinitionsContext()

const vueFlowInstance = useVueFlow()
const { navigateToNewNode } = useCanvasNavigation(vueFlowInstance)

const { getAvailableActions } = useStepActions(template, strings)

const { dimensions, registerNode } = useNodeSizeObserver()

const canvasViewModel = useCanvasViewModel(
  toRef(() => props.viewModel.canvasSteps),
  toRef(() => props.viewModel.connections),
  template,
  getAvailableActions
)

const { layoutNodes, edges, hasInitialLayout, isLayoutRunning } = useLayout(
  toRef(() => canvasViewModel.value.tracks),
  toRef(() => canvasViewModel.value.edges),
  dimensions
)

const { updateContent } = useProjectContent()

const nodes = computed(() => {
  return layoutNodes.value
    .map((layoutNode) => {
      const enriched = canvasViewModel.value.nodeMap.get(layoutNode.id)
      if (!enriched) return null

      const definition: CanvasStepDefinition = {
        label: enriched.label,
        placeholder: enriched.placeholder,
        hint: enriched.instruction,
        category: enriched.category,
      }

      const content: CanvasStepContent = {
        text: enriched.content,
      }

      return {
        ...layoutNode,
        type: enriched.editorFormat === 'plain' ? 'plainText' : 'richText',
        data: {
          id: layoutNode.id,
          definition,
          content,
          actions: enriched.actions,
        },
      }
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)
})

const handleContentUpdate = (id: string, content: CanvasStepContent) => {
  updateContent(id, content.text)
}

const handleActionClick = (action: ActionDefinition) => {
  const newNodeId = action.execute()

  if (newNodeId) {
    navigateToNewNode(newNodeId)
  }
}

const isLoading = computed(() => isLayoutRunning.value || !hasInitialLayout.value)
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';

.vue-flow__connection-path {
  stroke: var(--color-edge);
}

.vue-flow__controls-button {
  border-bottom: 1px solid var(--color-edge);
  background-color: transparent;
}

.vue-flow__controls-button:last-child {
  border-bottom: none;
}
</style>
