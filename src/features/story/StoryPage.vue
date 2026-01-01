<template>
  <div style="width: 100vw; height: 100vh">
    <StoryCanvas :data="data" :template="template" :strings="strings" />
  </div>
</template>

<script setup lang="ts">
import StoryCanvas from '@features/story-canvas/components/StoryCanvas.vue'
import { useProjectData } from './useProjectData'

const { data, template, strings } = useProjectData()
</script>

<style scoped></style>
