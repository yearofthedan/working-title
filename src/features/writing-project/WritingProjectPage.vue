<template>
  <div style="width: 100vw; height: 100vh">
    <WritingProject :data="project" :template="template" :strings="strings" />
  </div>
</template>

<script setup lang="ts">
import WritingProject from '@/features/writing-project/WritingProject.vue'
import { useProjectData } from './domain/useProjectData'

const { project, template, strings } = useProjectData()
</script>

<style scoped></style>
