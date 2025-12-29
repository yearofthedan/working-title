<template>
  <div style="width: 100vw; height: 100vh">
    <StoryCanvas
      :project-data="data"
      :template="template"
      :strings="strings"
      @update:node-content-change="onNodeContentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { sampleData as data } from '@features/snowflake/data-stub'
import { template } from '@features/snowflake/template'
import { strings } from '@features/snowflake/strings'
import StoryCanvas from '@features/story-canvas/components/StoryCanvas.vue'

const onNodeContentChange = (id: string, content: string) => {
  console.log('onNodeContentChange', id, content)
}
</script>

<style>
body {
  margin: 0;
}
</style>
