<template>
  <div class="flex w-full h-screen overflow-hidden">
    <StoryCanvasSidebar :nodes="viewModel.sidebar.nodes" @update:content="onSidebarChange" />
    <StoryCanvasVueFlow :tracks="viewModel.tracks" @update:node-content="onContentChange" />
  </div>
</template>

<script setup lang="ts">
import type { ProjectData } from '@/specs/projectDataSpec'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import { toRef } from 'vue'
import { useProjectViewModel } from '@features/story-canvas/composables/useProjectViewModel'
import StoryCanvasVueFlow from '@/features/story-canvas/StoryCanvasVueFlow.vue'
import StoryCanvasSidebar from '@/features/story-canvas/sidebar/StoryCanvasSidebar.vue'

const props = defineProps<{
  data: ProjectData
  template: ProcessTemplate
  strings: Record<string, unknown>
}>()

const onContentChange = (payload: { id: string; content: string }) => {
  console.log('canvas node changed', payload)
}

const { viewModel } = useProjectViewModel(
  toRef(props.data),
  toRef(props.template),
  toRef(props.strings)
)

const onSidebarChange = (payload: { id: string; content: string }) => {
  console.log('sidebar node changed', payload)
}
</script>

<style></style>
