<template>
  <div class="grow relative bg-background" :aria-busy="isLoading">
    <AppLoadingOverlay
      :is-loading="isLoading"
      message="Loading canvas..."
      aria-label="Story canvas is loading"
    />

    <EmptyCanvas v-if="hasInitialLayout && nodes.length === 0" />

    <VueFlow
      v-if="nodes.length > 0"
      :nodes="nodes"
      :edges="edges"
      :apply-default="false"
      :class="{ 'opacity-0': !hasInitialLayout }"
    >
      <template #node-richText="{ id, data: nodeData }">
        <RichTextNode
          :ref="(el: any) => registerNode(id, el?.$el || el)"
          :data="nodeData"
          @update:content="(content) => updateNodeContent(id, content)"
        />
      </template>
      <template #node-plainText="{ id, data: nodeData }">
        <RichTextNode
          :ref="(el: any) => registerNode(id, el?.$el || el)"
          :data="nodeData"
          @update:content="(content) => updateNodeContent(id, content)"
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
import { VueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useLayout } from '@/features/story-canvas/composables/useLayout'
import { useNodeSizeObserver } from '@/features/story-canvas/composables/useNodeSizeObserver'
import type { TracksViewModel } from '@/features/story-canvas/composables/useProjectViewModel'
import RichTextNode from '@/features/story-canvas/RichTextNode.vue'
import EmptyCanvas from '@/features/story-canvas/components/EmptyCanvas.vue'

const props = defineProps<{
  tracks: TracksViewModel
}>()

const emit = defineEmits<{
  (e: 'update:nodeContent', payload: { id: string; content: string }): void
}>()

const { dimensions, registerNode } = useNodeSizeObserver()
const { nodes, edges, hasInitialLayout, isLayoutRunning } = useLayout(
  toRef(() => props.tracks),
  dimensions
)

const isLoading = computed(() => isLayoutRunning.value || !hasInitialLayout.value)

const updateNodeContent = (id: string, content: string) => {
  emit('update:nodeContent', { id, content })
}
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
