<template>
  <div style="width: 100vw; height: 100vh">
    <WritingProject :data="fullSampleData" :template="template" :strings="strings" />
  </div>
</template>

<script setup lang="ts">
import { fullSampleData } from '@/features/demo/project-data'
import { template } from '@/features/process-templates/snowflake/template'
import { strings } from '@/features/process-templates/snowflake/strings'
import WritingProject from '@/features/writing-project/WritingProject.vue'
</script>

<style scoped></style>
