<template>
  <div style="width: 100vw; height: 100vh">
    <StoryCanvas :data="fullSampleData" :template="template" :strings="strings" />
  </div>
</template>

<script setup lang="ts">
import { fullSampleData } from '@/features/demo/project-data'
import { template } from '@features/snowflake/template'
import { strings } from '@features/snowflake/strings'
import StoryCanvas from '@features/story-canvas/components/StoryCanvas.vue'
</script>

<style scoped></style>
