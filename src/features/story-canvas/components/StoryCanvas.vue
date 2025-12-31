<template>
  <div class="flex w-full h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="w-[300px] flex flex-col bg-paper border-r border-edge transition-colors duration-300"
    >
      <div class="p-4 border-b border-edge">
        <h2 class="text-xs font-bold uppercase tracking-widest text-ink/80">Project Context</h2>
      </div>

      <div class="p-4 overflow-y-auto flex-1 space-y-6">
        <div v-for="node in sidebarNodes" :key="node.id" class="space-y-2">
          <label class="block text-[10px] font-bold uppercase tracking-widest text-ink/50">
            {{ node.label }}
          </label>
          <!-- Removed elevation/shadow. Using a subtle 'field' look for future editability -->
          <div
            class="text-sm leading-relaxed text-ink p-3 bg-ink/4 rounded-sm transition-colors border border-transparent focus-within:border-edge"
          >
            {{ node.content }}
          </div>
        </div>
      </div>
    </aside>

    <!-- Canvas -->
    <div class="flex-grow relative">
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

        <Controls class="border border-edge bg-paper fill-ink" />

        <MiniMap class="border border-edge bg-paper" />
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
