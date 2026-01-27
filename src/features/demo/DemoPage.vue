<template>
  <div style="width: 100vw; height: 100vh">
    <WritingProject :data="fullSampleData" :template="template" />
  </div>
</template>

<script setup lang="ts">
import { fullSampleData } from '@/features/demo/project-data'
import { template } from '@/features/process-templates/snowflake/template'
import WritingProject from '@/features/writing-project/WritingProject.vue'
</script>

<style scoped></style>
