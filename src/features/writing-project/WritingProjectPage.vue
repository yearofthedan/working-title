<template>
  <div style="width: 100vw; height: 100vh">
    <AppLoadingOverlay v-if="isBootstrapping" :is-loading="true" message="Loading project..." />
    <WritingProject v-else-if="template && project" :data="project" :template="template" />
    <div v-else class="flex-center h-full">
      <p>Project not found. Please return to the <router-link to="/">Home Page</router-link>.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import WritingProject from '@/features/writing-project/WritingProject.vue'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useProjectData } from './domain/useProjectData'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import { registerTemplateMessages } from '@/i18n'
import { projectStorage } from './storage/ProjectStorage'
import { loadTemplate, loadTemplateLocales } from '@/features/process-templates/templateRegistry'
import type { ProjectData } from './storage/types'

const template = ref<ProcessTemplate | null>(null)
const isBootstrapping = ref(true)
const projectState = ref<{ project: Ref<ProjectData> } | null>(null)

const project = computed(() => projectState.value?.project)

onMounted(async () => {
  try {
    const loadedProject = await projectStorage.loadCurrent()
    if (!loadedProject) {
      isBootstrapping.value = false
      return
    }

    const templateId = loadedProject.templateId

    // Load template and locales via registry (no hardcoded snowflake paths here)
    const [templateModule, locales] = await Promise.all([
      loadTemplate(templateId),
      loadTemplateLocales(templateId),
    ])

    // Register locale messages
    Object.entries(locales).forEach(([locale, messages]) => {
      registerTemplateMessages(templateId, locale, messages)
    })

    // Set template
    template.value = templateModule.template

    // Initialize project data management
    projectState.value = useProjectData(loadedProject)
  } catch (error) {
    console.error('Failed to bootstrap template:', error)
  } finally {
    isBootstrapping.value = false
  }
})
</script>

<style scoped>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
