<template>
  <VueFlow :nodes="layoutElements.nodes" :edges="layoutElements.edges" :apply-default="false">
    <template #node-richText="{ id, data }">
      <RichTextNode :data="data" @update:content="(content) => onNodeContentChange(id, content)" />
    </template>
    <template #node-plainText="{ id, data }">
      <RichTextNode :data="data" @update:content="(c) => onNodeContentChange(id, c)" />
    </template>
    <template #node-globalText="{ id, data }">
      <RichTextNode :data="data" @update:content="(c) => onNodeContentChange(id, c)" />
    </template>
    <Background />
    <Controls />
    <MiniMap />
  </VueFlow>
  <aside class="project-sidebar">
    <div class="sidebar-content">
      <div v-for="node in layoutElements.sidebarNodes" :key="node.id" class="context-item">
        <label>{{ node.label }}</label>
        <div class="context-value">
          {{ node.content }}
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import RichTextNode from '@features/story-canvas/components/RichTextNode.vue'
import type { StoryCanvasProject } from '@features/shared/dataSpec'
import type { NarrativeTemplate } from '@features/shared/storySpec'
import { computed } from 'vue'
import { mapProjectToVueFlowElements as mapProjectToElements } from '@features/story-canvas/components/vueFlowMapper'

const props = defineProps<{
  projectData: StoryCanvasProject
  template: NarrativeTemplate
  strings: Record<string, unknown>
}>()

const layoutElements = computed(() => {
  return mapProjectToElements(props.projectData, props.template, props.strings)
})

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
@import '@vue-flow/controls/dist/style.css';
.vue-flow__node {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 5px;
  background-color: white;
}
</style>
