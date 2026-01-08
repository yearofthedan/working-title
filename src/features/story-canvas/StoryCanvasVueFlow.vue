<template>
  <div class="grow relative bg-background">
    <VueFlow :nodes="nodes" :edges="edges" :apply-default="false">
      <template #node-richText="{ id, data: nodeData }">
        <RichTextNode
          :data="nodeData"
          @update:content="(content) => updateNodeContent(id, content)"
        />
      </template>
      <template #node-plainText="{ id, data: nodeData }">
        <RichTextNode :data="nodeData" @update:content="(c) => updateNodeContent(id, c)" />
      </template>
      <Background />
      <Controls class="border border-edge bg-paper fill-ink" />
      <MiniMap class="border border-edge bg-paper" />
    </VueFlow>
  </div>
</template>
<script setup lang="ts">
import { VueFlow, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import RichTextNode from '@/features/story-canvas/RichTextNode.vue'

const nodes = defineModel<Node[]>('nodes', { required: true })
const edges = defineModel<Edge[]>('edges', { required: true })

const emit = defineEmits<{
  (e: 'update:nodeContent', payload: { id: string; content: string }): void
}>()

const updateNodeContent = (nodeId: string, content: string) => {
  const node = nodes.value.find((n) => n.id === nodeId)
  if (node?.data) {
    node.data.content = content
  }

  emit('update:nodeContent', { id: nodeId, content })
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
