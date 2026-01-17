<template>
  <div class="flex w-full h-screen overflow-hidden">
    <StoryCanvasSidebar :nodes="viewModel.sidebar.nodes" @update:content="onSidebarChange" />
    <Suspense>
      <StoryCanvasVueFlow :tracks="viewModel.tracks" @update:node-content="onContentChange" />
      <template #fallback>
        <div class="grow flex items-center justify-center bg-background">
          <AppLoadingOverlay :is-loading="true" message="Loading canvas..." />
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { toRef, defineAsyncComponent } from 'vue'
import type { ProjectData } from '@/specs/projectDataSpec'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import { useProjectViewModel } from '@features/story-canvas/composables/useProjectViewModel'
import { useProjectMutations } from '@/features/story/composables/useProjectMutations'
import StoryCanvasSidebar from '@/features/story-canvas/sidebar/StoryCanvasSidebar.vue'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'

const StoryCanvasVueFlow = defineAsyncComponent(
  () => import('@/features/story-canvas/StoryCanvasVueFlow.vue')
)

const props = defineProps<{
  data: ProjectData
  template: ProcessTemplate
  strings: Record<string, unknown>
}>()

const { updateStepContent } = useProjectMutations(toRef(() => props.data))

const onContentChange = (payload: { id: string; content: string }) => {
  updateStepContent(payload.id, payload.content)
}

const { viewModel } = useProjectViewModel(
  toRef(props.data),
  toRef(props.template),
  toRef(props.strings)
)

const onSidebarChange = (payload: { id: string; content: string }) => {
  updateStepContent(payload.id, payload.content)
}
</script>

<style></style>
