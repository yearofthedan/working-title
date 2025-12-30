<template>
  <div style="width: 100vw; height: 100vh">
    <h1>Home</h1>
    <RouterLink :to="{ name: RouteNames.Demo }">Demo</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RouteNames } from '@/router/routes'
</script>

<style scoped></style>
