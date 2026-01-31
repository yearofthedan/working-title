<script setup lang="ts">
import WritingProject from '@/features/writing-project/WritingProject.vue'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useRoute } from 'vue-router'
import { useProjectLoader } from './composables/useProjectLoader'

const route = useRoute()
const id = route.params.id as string
const { state } = useProjectLoader(id)
</script>
<template>
  <div style="width: 100vw; height: 100vh">
    <AppLoadingOverlay
      v-if="state.status === 'loading'"
      :is-loading="true"
      message="Loading project..."
    />
    <WritingProject v-else-if="state.status === 'success'" :project="state.data" />
    <div v-else class="flex-center h-full">
      <p>Project not found. Please return to the <router-link to="/">Home Page</router-link>.</p>
    </div>
  </div>
</template>
<style scoped>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
