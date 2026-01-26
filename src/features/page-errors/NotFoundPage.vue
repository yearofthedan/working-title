<template>
  <div style="width: 100vw; height: 100vh">
    <h1>{{ t('app.notFound.title') }}</h1>
    <RouterLink :to="{ name: RouteNames.Home }">{{ t('app.notFound.backHome') }}</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteNames } from '@/router/routes'

const { t } = useI18n()
</script>

<style scoped></style>
