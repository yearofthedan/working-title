<template>
  <div class="grow relative bg-background" :aria-busy="isLoading">
    <CanvasLayoutIndicator :is-loading="isLayoutRunning && hasInitialLayout" />

    <AppLoadingOverlay
      :is-loading="!hasInitialLayout"
      message="Loading canvas..."
      aria-label="Story canvas is loading"
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
        <RichTextNode
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
        <RichTextNode
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
import { useLayout } from '@/features/story-canvas/composables/useLayout'
import { useCanvasNavigation } from '@/features/story-canvas/composables/useCanvasNavigation'
import { useNodeSizeObserver } from '@/features/story-canvas/composables/useNodeSizeObserver'
import { useDefinitionsContext } from '@/features/story-canvas/composables/useDefinitionsContext'
import { useContentContext } from '@/features/story-canvas/composables/useContentContext'
import type { ActionDefinition } from '@/features/story/composables/useStepActions'
import type {
  TracksViewModel,
  CanvasNode,
} from '@/features/story-canvas/composables/useProjectViewModel'
import type {
  RichTextNodeDefinition,
  RichTextNodeContent,
} from '@/features/story-canvas/components/nodes/types'
import RichTextNode from '@/features/story-canvas/components/nodes/RichTextNode.vue'
import EmptyCanvas from '@/features/story-canvas/components/EmptyCanvas.vue'
import CanvasLayoutIndicator from '@/features/story-canvas/components/CanvasLayoutIndicator.vue'
import type { ProjectData } from '../story/types'

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

    const definition: RichTextNodeDefinition = {
      label: fullStepDef?.label ?? 'Unknown',
      placeholder: fullStepDef?.placeholder,
      hint: fullStepDef?.instruction,
      category: fullStepDef?.category,
    }

    const content: RichTextNodeContent = {
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

const handleContentUpdate = (id: string, content: RichTextNodeContent) => {
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
