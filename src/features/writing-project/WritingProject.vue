<template>
  <div class="flex w-full h-screen overflow-hidden">
    <ProjectSidebar :step-ids="viewModel.sidebarSteps.map((s) => s.id)" />
    <Suspense>
      <ProjectCanvas :view-model="viewModel" />
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
import ProjectSidebar from '@/features/writing-project/project-sidebar/ProjectSidebar.vue'
import { provideDefinitionsContext } from '@/features/writing-project/view-model/useDefinitionsContext'
import { provideProjectContext } from '@/features/writing-project/view-model/useProjectContext'
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

provideProjectContext(toRef(() => props.data))

provideDefinitionsContext(
  toRef(() => props.template),
  toRef(() => props.strings)
)

const { viewModel } = useProjectViewModel(
  toRef(() => props.data),
  toRef(() => props.template)
)
</script>

<style></style>
