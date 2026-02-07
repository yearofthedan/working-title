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
import ProjectSidebar from '@/features/writing-project/project-sidebar/ProjectSidebar.vue'
import { provideDefinitionsContext } from '@/features/writing-project/composables/useDefinitionsContext'
import { provideActiveProjectContext } from '@/features/writing-project/composables/useActiveProjectContext'
import AppLoadingOverlay from '@/features/common/feedback/AppLoadingOverlay.vue'
import type { Project } from './composables/useProjectLoader'

const ProjectCanvas = defineAsyncComponent(
  () => import('@/features/writing-project/project-canvas/ProjectCanvas.vue')
)

const props = defineProps<{
  project: Project
}>()

provideActiveProjectContext(toRef(() => props.project.data))

provideDefinitionsContext(toRef(() => props.project.template))
</script>

<style></style>
