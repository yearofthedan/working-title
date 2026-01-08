<template>
  <div class="flex w-full h-screen overflow-hidden">
    <StoryCanvasSidebar v-model="sidebarNodes" @update:model-value="onSidebarChange" />
    <StoryCanvasVueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      @update:node-content="onCanvasNodeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { type Node, type Edge } from '@vue-flow/core'
import type { ProjectData } from '@/features/shared/projectDataSpec'
import type { ProcessTemplate } from '@/features/shared/processTemplateSpec'
import { shallowRef, watchEffect } from 'vue'
import { mapProjectToViewModel } from '@features/story-canvas/model/viewModelMapper'
import type { SidebarNode } from '@features/story-canvas/types'
import StoryCanvasVueFlow from '@/features/story-canvas/StoryCanvasVueFlow.vue'
import StoryCanvasSidebar from '@/features/story-canvas/sidebar/StoryCanvasSidebar.vue'

const props = defineProps<{
  data: ProjectData
  template: ProcessTemplate
  strings: Record<string, unknown>
}>()

const nodes = shallowRef<Node[]>([])
const edges = shallowRef<Edge[]>([])
const sidebarNodes = shallowRef<SidebarNode[]>([])

const onCanvasNodeChange = (payload: { id: string; content: string }) => {
  console.log('canvas node changed', payload)
}

const onSidebarChange = (updatedNodes: SidebarNode[]) => {
  const changed = updatedNodes.find((node, idx) => {
    return node.content !== sidebarNodes.value[idx]?.content
  })

  if (changed) {
    console.log('changed', changed)
  }
}

watchEffect(async () => {
  try {
    const result = await mapProjectToViewModel(props.data, props.template, props.strings)
    nodes.value = result.canvas.nodes
    edges.value = result.canvas.edges
    sidebarNodes.value = result.sidebar.nodes
  } catch (e) {
    console.error('Layout failed:', e)
  }
})
</script>

<style></style>
