<template>
  <VueFlow :nodes="nodes" :edges="edges" :apply-default="false">
    <template #node-richText="{ id, data }">
      <RichTextNode
        :content="data.content"
        @update:content="(content) => onNodeContentChange(id, content)"
      />
    </template>

    <Background />
    <Controls />
    <MiniMap />
  </VueFlow>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import type { Node, Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import RichTextNode from '@features/story-canvas/components/RichTextNode.vue'

defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const emit = defineEmits<{
  (e: 'update:nodeContentChange', id: string, content: string): void
}>()

const onNodeContentChange = (nodeId: string, content: string) => {
  emit('update:nodeContentChange', nodeId, content)
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow__node {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 5px;
  background-color: white;
}
</style>
