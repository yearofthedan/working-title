<template>
  <div v-show="hasInitialLayout" class="grow relative bg-background">
    <VueFlow :nodes="nodes" :edges="edges" :apply-default="false">
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
import { toRef } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { Background } from '@vue-flow/background'
import { useLayout } from '@/features/story-canvas/composables/useLayout'
import { useNodeSizeObserver } from '@/features/story-canvas/composables/useNodeSizeObserver'
import type { TracksViewModel } from '@/features/story-canvas/composables/useProjectViewModel'
import RichTextNode from '@/features/story-canvas/RichTextNode.vue'

const props = defineProps<{
  tracks: TracksViewModel
}>()

const emit = defineEmits<{
  (e: 'update:nodeContent', payload: { id: string; content: string }): void
}>()

const { dimensions, registerNode } = useNodeSizeObserver()
const { nodes, edges, hasInitialLayout } = useLayout(
  toRef(() => props.tracks),
  dimensions
)

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
