<template>
  <div class="grow relative bg-background" :aria-busy="isLoading">
    <CanvasLayoutIndicator :is-loading="isLayoutRunning && hasInitialLayout" />

    <AppLoadingOverlay :is-loading="!hasInitialLayout" :message="t('app.loading.message')" />

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
          :ref="
            (el: unknown) =>
              registerNode(id, (el as ComponentPublicInstance)?.$el || (el as HTMLElement | null))
          "
          :definition="data.definition"
          :content="data.content"
          :actions="data.actions"
          @update:content="handleContentUpdate"
          @action-click="handleActionClick"
          @node-click="handleNodeClick"
        />
      </template>
      <template #node-plainText="{ id, data }">
        <CanvasStep
          :id="data.id"
          :ref="
            (el: unknown) =>
              registerNode(id, (el as ComponentPublicInstance)?.$el || (el as HTMLElement | null))
          "
          :definition="data.definition"
          :content="data.content"
          :actions="data.actions"
          @update:content="handleContentUpdate"
          @action-click="handleActionClick"
          @node-click="handleNodeClick"
        />
      </template>
      <Background />
      <Controls class="border border-edge bg-paper fill-ink" />
      <MiniMap class="border border-edge bg-paper" />
    </VueFlow>
  </div>
</template>
<script setup lang="ts">
import { toRef, computed, type ComponentPublicInstance } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import AppLoadingOverlay from '@/features/common/feedback/AppLoadingOverlay.vue'
import { useLayout } from '@/features/writing-project/canvas/composables/useLayout'
import { useCanvasNavigation } from '@/features/writing-project/canvas/composables/useCanvasNavigation'
import { useNodeSizeObserver } from '@/features/writing-project/canvas/composables/useNodeSizeObserver'
import type { ActionDefinition } from '@/features/writing-project/composables/useStepActions'
import type {
  CanvasStepDefinition,
  CanvasStepContent,
} from '@/features/writing-project/canvas/stepTypes'
import CanvasStep from '@/features/writing-project/canvas/step/CanvasStep.vue'
import EmptyCanvas from '@/features/writing-project/canvas/EmptyCanvas.vue'
import CanvasLayoutIndicator from '@/features/writing-project/canvas/CanvasLayoutIndicator.vue'
import { useCanvasViewModel } from './composables/useCanvasViewModel'
import { useStepActions } from '../composables/useStepActions'
import { useProjectContent, useProjectSteps } from '../composables/useActiveProjectContext'
import { useDefinitionsContext } from '../composables/useDefinitionsContext'
import { useI18n } from 'vue-i18n'
import { useDetailPanel } from '../step-panel/useDetailPanel'

const { template } = useDefinitionsContext()
const { t } = useI18n()
const vueFlowInstance = useVueFlow()
const { navigateToNewNode } = useCanvasNavigation(vueFlowInstance)
const { openPanel } = useDetailPanel()

const { getAvailableActions } = useStepActions(template)

const { dimensions, registerNode } = useNodeSizeObserver()

const { steps, connections } = useProjectSteps()

const canvasViewModel = useCanvasViewModel(steps, connections, template, getAvailableActions)

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
        scope: enriched.scope,
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

const handleNodeClick = (id: string) => {
  openPanel(id)
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
