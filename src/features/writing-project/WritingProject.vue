<template>
  <div class="flex w-full h-screen overflow-hidden">
    <ProjectSidebar :nodes="viewModel.sidebar.nodes" />
    <Suspense>
      <ProjectCanvas
        :tracks="viewModel.tracks"
        :template="template"
        :project-data="data"
        :strings="strings"
        @add-root-step="onAddRootStep"
      />
      <template #fallback>
        <div class="grow flex items-center justify-center bg-background">
          <AppLoadingOverlay :is-loading="true" message="Loading project..." />
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { toRef, defineAsyncComponent } from 'vue'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import { useProjectViewModel } from '@/features/writing-project/view-model/useProjectViewModel'
import { useProjectMutations } from '@/features/writing-project/domain/useProjectMutations'
import ProjectSidebar from '@/features/writing-project/project-sidebar/ProjectSidebar.vue'
import { useStepActions } from '@/features/writing-project/view-model/useStepActions'
import { provideContentContext } from '@/features/writing-project/view-model/useContentContext'
import { provideDefinitionsContext } from '@/features/writing-project/view-model/useDefinitionsContext'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import type { ProjectData } from '@/features/writing-project/domain/types'

const ProjectCanvas = defineAsyncComponent(
  () => import('@/features/writing-project/project-canvas/ProjectCanvas.vue')
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
