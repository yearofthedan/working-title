<template>
  <div class="story-canvas-wrapper">
    <aside class="project-sidebar">
      <div class="sidebar-header">
        <h2>Project Context</h2>
      </div>
      <div class="sidebar-content">
        <div v-for="node in sidebarNodes" :key="node.id" class="context-item">
          <label>{{ node.label }}</label>
          <div class="context-value">
            {{ node.content }}
          </div>
        </div>
      </div>
    </aside>

    <div class="canvas-viewport">
      <VueFlow :nodes="nodes" :edges="edges" :apply-default="false">
        <template #node-richText="{ id, data: nodeData }">
          <RichTextNode
            :data="nodeData"
            @update:content="(content) => onNodeContentChange(id, content)"
          />
        </template>
        <template #node-plainText="{ id, data: nodeData }">
          <RichTextNode :data="nodeData" @update:content="(c) => onNodeContentChange(id, c)" />
        </template>
        <template #node-globalText="{ id, data: nodeData }">
          <RichTextNode :data="nodeData" @update:content="(c) => onNodeContentChange(id, c)" />
        </template>
        <Background />
        <Controls />
        <MiniMap />
      </VueFlow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, type Node, type Edge } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import RichTextNode from '@features/story-canvas/components/RichTextNode.vue'
import type { StoryProject } from '@features/shared/dataSpec'
import type { NarrativeTemplate } from '@features/shared/storySpec'
import { shallowRef, watchEffect } from 'vue'
import { mapProjectToVueFlow } from '@features/story-canvas/components/storyCanvasMapper'
import type { SidebarNode } from '@features/story-canvas/components/storyCanvasMapper'

const props = defineProps<{
  data: StoryProject
  template: NarrativeTemplate
  strings: Record<string, unknown>
}>()

const nodes = shallowRef<Node[]>([])
const edges = shallowRef<Edge[]>([])
const sidebarNodes = shallowRef<SidebarNode[]>([])

const emit = defineEmits<{
  (e: 'update:nodeContentChange', id: string, content: string): void
}>()

const onNodeContentChange = (nodeId: string, content: string) => {
  emit('update:nodeContentChange', nodeId, content)
}

watchEffect(async () => {
  try {
    const result = await mapProjectToVueFlow(props.data, props.template, props.strings)
    nodes.value = result.canvas.nodes
    edges.value = result.canvas.edges
    sidebarNodes.value = result.sidebar.nodes
  } catch (e) {
    console.error('Layout failed:', e)
  }
})
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
.story-canvas-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.project-sidebar {
  width: 300px;
  background-color: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.sidebar-content {
  padding: 16px;
  overflow-y: auto;
}

.context-item {
  margin-bottom: 24px;
}

.context-item label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 8px;
}

.context-value {
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #334155;
  line-height: 1.5;
}

.canvas-viewport {
  flex-grow: 1;
  position: relative;
}

.vue-flow__node {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 5px;
  background-color: white;
}
</style>
