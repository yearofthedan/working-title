<template>
  <div class="flex w-full h-screen overflow-hidden">
    <ProjectSidebar />
    <Suspense>
      <ProjectCanvas />
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
import ProjectSidebar from '@/features/writing-project/project-sidebar/ProjectSidebar.vue'
import { provideDefinitionsContext } from '@/features/writing-project/domain/useDefinitionsContext'
import { provideProjectContext } from '@/features/writing-project/domain/useProjectContext'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import type { ProjectData } from '@/features/writing-project/storage/types'

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
</script>

<style></style>
