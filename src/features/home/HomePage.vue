<template>
  <div class="flex flex-col items-center justify-center gap-6 py-12">
    <h1 class="text-3xl font-bold underline dark:text-white">Home</h1>
    <RouterLink
      :to="{ name: RouteNames.Demo }"
      class="px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-opacity-80 dark:bg-gray-700 dark:text-white"
    >
      Demo
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RouteNames } from '@/router/routes'
</script>

<style scoped></style>
