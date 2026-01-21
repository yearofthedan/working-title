<template>
  <div style="width: 100vw; height: 100vh">
    <AppLoadingOverlay v-if="isLoading" :is-loading="true" message="Loading project..." />
    <WritingProject v-else :data="project" :template="template" :strings="strings" />
  </div>
</template>

<script setup lang="ts">
import WritingProject from '@/features/writing-project/WritingProject.vue'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useProjectData } from './domain/useProjectData'

const { project, isLoading, template, strings } = useProjectData()
</script>

<style scoped></style>
