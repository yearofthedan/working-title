<template>
  <div class="grow relative bg-background" :aria-busy="isLoading">
    <CanvasLayoutIndicator :is-loading="isLayoutRunning && hasInitialLayout" />

    <AppLoadingOverlay
      :is-loading="!hasInitialLayout"
      message="Loading project..."
      aria-label="Opening project"
    />

    <EmptyCanvas
      v-if="hasInitialLayout && nodes.length === 0"
      :template="template"
      :project-data="projectData"
      :strings="strings"
      @add-root-step="(stepId) => emit('add-root-step', stepId)"
    />

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
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useLayout } from '@/features/writing-project/project-canvas/composables/useLayout'
import { useCanvasNavigation } from '@/features/writing-project/project-canvas/composables/useCanvasNavigation'
import { useNodeSizeObserver } from '@/features/writing-project/project-canvas/composables/useNodeSizeObserver'
import { useDefinitionsContext } from '@/features/writing-project/view-model/useDefinitionsContext'
import { useContentContext } from '@/features/writing-project/view-model/useContentContext'
import type { ActionDefinition } from '@/features/writing-project/view-model/useStepActions'
import type {
  CanvasStepDefinition,
  CanvasStepContent,
} from '@/features/writing-project/project-canvas/stepTypes'
import CanvasStep from '@/features/writing-project/project-canvas/canvas-step/CanvasStep.vue'
import EmptyCanvas from '@/features/writing-project/project-canvas/EmptyCanvas.vue'
import CanvasLayoutIndicator from '@/features/writing-project/project-canvas/CanvasLayoutIndicator.vue'
import type { ProjectData } from '@/features/writing-project/domain/types'
import type { CanvasNode, TracksViewModel } from '../view-model/types'

const props = defineProps<{
  tracks: TracksViewModel
  template: ProcessTemplate
  projectData: ProjectData
  strings: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'add-root-step', stepId: string): void
}>()

const vueFlowInstance = useVueFlow()
const { navigateToNewNode } = useCanvasNavigation(vueFlowInstance)

const { dimensions, registerNode } = useNodeSizeObserver()
const { layoutNodes, edges, hasInitialLayout, isLayoutRunning } = useLayout(
  toRef(() => props.tracks),
  dimensions
)

const { getStepDef } = useDefinitionsContext()
const { getContent, updateContent } = useContentContext()

const nodeMetadataMap = computed(() => {
  const map = new Map<string, CanvasNode>()
  props.tracks.tracks.forEach((track) => {
    track.nodes.forEach((node) => {
      map.set(node.id, node)
    })
  })
  return map
})

const nodes = computed(() => {
  return layoutNodes.value.map((layoutNode) => {
    const metadata = nodeMetadataMap.value.get(layoutNode.id)
    const fullStepDef = getStepDef(metadata?.stepId ?? '')
    const fullContent = getContent(layoutNode.id)

    const definition: CanvasStepDefinition = {
      label: fullStepDef?.label ?? 'Unknown',
      placeholder: fullStepDef?.placeholder,
      hint: fullStepDef?.instruction,
      category: fullStepDef?.category,
    }

    const content: CanvasStepContent = {
      text: fullContent?.content.text ?? '',
    }

    return {
      ...layoutNode,
      type: fullStepDef?.editorConfig.format === 'plain' ? 'plainText' : 'richText',
      data: {
        id: layoutNode.id,
        definition,
        content,
        actions: metadata?.actions,
      },
    }
  })
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
