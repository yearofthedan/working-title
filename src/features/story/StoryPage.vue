<template>
  <div style="width: 100vw; height: 100vh">
    <StoryCanvas :data="project" :template="template" :strings="strings" />
  </div>
</template>

<script setup lang="ts">
import StoryCanvas from '@/features/story-canvas/StoryCanvas.vue'
import { useProjectData } from './useProjectData'

const { project, template, strings } = useProjectData()
</script>

<style scoped></style>
