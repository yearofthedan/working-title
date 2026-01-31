<script setup lang="ts">
import { fullSampleData } from '@/features/demo/project-data'
import { template } from '@/features/process-templates/snowflake/template'
import WritingProject from '@/features/writing-project/WritingProject.vue'
import type { Project } from '../writing-project/composables/useProjectLoader'

const project: Project = {
  template: template,
  data: fullSampleData,
}
</script>

<template>
  <div style="width: 100vw; height: 100vh">
    <WritingProject :project="project" />
  </div>
</template>

<style scoped></style>
