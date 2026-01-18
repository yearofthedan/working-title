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
      <template #node-richText="{ id, data: nodeData }">
        <RichTextNode :ref="(el: any) => registerNode(id, el?.$el || el)" :data="nodeData" />
      </template>
      <template #node-plainText="{ id, data: nodeData }">
        <RichTextNode :ref="(el: any) => registerNode(id, el?.$el || el)" :data="nodeData" />
      </template>
      <Background />
      <Controls class="border border-edge bg-paper fill-ink" />
      <MiniMap class="border border-edge bg-paper" />
    </VueFlow>
  </div>
</template>
<script setup lang="ts">
import { toRef, computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import type { ProjectData } from '@/specs/projectDataSpec'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useLayout } from '@/features/story-canvas/composables/useLayout'
import { useNodeSizeObserver } from '@/features/story-canvas/composables/useNodeSizeObserver'
import type { TracksViewModel } from '@/features/story-canvas/composables/useProjectViewModel'
import RichTextNode from '@/features/story-canvas/RichTextNode.vue'
import EmptyCanvas from '@/features/story-canvas/components/EmptyCanvas.vue'
import CanvasLayoutIndicator from '@/features/story-canvas/components/CanvasLayoutIndicator.vue'

const props = defineProps<{
  tracks: TracksViewModel
  template: ProcessTemplate
  projectData: ProjectData
  strings: Record<string, unknown>
}>()

const emit = defineEmits<{
  (e: 'add-root-step', stepId: string): void
}>()

const { dimensions, registerNode } = useNodeSizeObserver()
const { layoutNodes, edges, hasInitialLayout, isLayoutRunning } = useLayout(
  toRef(() => props.tracks),
  dimensions
)

const nodes = computed(() => {
  return layoutNodes.value.map((layoutNode) => {
    const metadata = props.tracks.tracks.flatMap((t) => t.nodes).find((n) => n.id === layoutNode.id)

    return {
      ...layoutNode,
      data: metadata,
    }
  })
})

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
