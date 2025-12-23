<template>
  <div style="width: 100vw; height: 100vh">
    <StoryCanvas :nodes="nodes" :edges="edges" @update:node-content-change="onNodeContentChange" />
  </div>
</template>

<script setup lang="ts">
import { nodes, edges } from '@features/snowflake/data-stub'
import StoryCanvas from '@features/story-canvas/components/StoryCanvas.vue'

const onNodeContentChange = (id: string, content: string) => {
  const node = nodes.value.find((node) => node.id === id)
  if (node) {
    node.data.content = content
  }
}
</script>

<style>
body {
  margin: 0;
}
</style>
