<template>
  <div style="width: 100vw; height: 100vh">
    <h1>404 - Page Not Found</h1>
    <RouterLink :to="{ name: RouteNames.Home }">Home</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RouteNames } from '@/router/routes'
</script>

<style scoped></style>
