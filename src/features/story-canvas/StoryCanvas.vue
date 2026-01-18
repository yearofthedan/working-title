<template>
  <div class="flex w-full h-screen overflow-hidden">
    <StoryCanvasSidebar :nodes="viewModel.sidebar.nodes" />
    <Suspense>
      <StoryCanvasVueFlow
        :tracks="viewModel.tracks"
        :template="template"
        :project-data="data"
        :strings="strings"
        @add-root-step="onAddRootStep"
      />
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
import { useStepActions } from '@/features/story/composables/useStepActions'
import { provideContentContext } from '@/features/story-canvas/composables/useContentContext'
import { provideDefinitionsContext } from '@/features/story-canvas/composables/useDefinitionsContext'
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

const mutations = useProjectMutations(toRef(() => props.data))
const { updateStepContent, addStep } = mutations

const { getAvailableActions } = useStepActions(
  toRef(() => props.data),
  toRef(() => props.template),
  toRef(() => props.strings),
  mutations
)

provideContentContext(
  toRef(() => props.data),
  updateStepContent
)

provideDefinitionsContext(
  toRef(() => props.template),
  toRef(() => props.strings)
)

const { viewModel } = useProjectViewModel(
  toRef(() => props.data),
  toRef(() => props.template),
  toRef(() => getAvailableActions)
)

const onAddRootStep = (stepId: string) => {
  addStep(stepId)
}
</script>

<style></style>
