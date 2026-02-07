<script setup lang="ts">
import { RouterView } from 'vue-router'
import { provideProjectStore } from '@/features/project-storage/context'
import AppNotificationContainer from '@/features/common/feedback/AppNotificationContainer.vue'
import DevHeader from './DevHeader.vue'

provideProjectStore()
const isDev = import.meta.env.DEV
</script>
<template>
  <DevHeader />
  <div :class="isDev ? 'pt-7' : ''">
    <RouterView />
  </div>
  <AppNotificationContainer />
</template>
<style>
body {
  margin: 0;
}
</style>
