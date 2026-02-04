<script setup lang="ts">
import WritingProject from '@/features/writing-project/WritingProject.vue'
import AppLoadingOverlay from '@/features/common/AppLoadingOverlay.vue'
import { useRoute } from 'vue-router'
import { useProjectLoader } from './composables/useProjectLoader'
import { useI18n } from 'vue-i18n'
import AppIcon from '@/features/common/AppIcon.vue'

const { t } = useI18n()
const route = useRoute()
const id = route.params.id as string
const { state, reload } = useProjectLoader(id)

const handleRetry = () => {
  reload(id)
}
</script>

<template>
  <div class="w-screen h-screen bg-paper">
    <AppLoadingOverlay
      v-if="state.status === 'loading'"
      :is-loading="true"
      :message="t('app.project.loading')"
    />
    <WritingProject v-else-if="state.status === 'success' && state.data" :project="state.data" />
    <div v-else class="flex flex-col items-center justify-center h-full text-center p-8">
      <div class="mb-6">
        <AppIcon name="warning" class="text-4xl text-ink/20" />
      </div>
      <h2 class="text-xl font-serif italic text-ink mb-4">
        {{ t('app.project.loadError.title') }}
      </h2>
      <p class="text-sm text-ink-muted mb-8 max-w-md">
        {{ t('app.project.loadError.description') }}
      </p>
      <div class="flex gap-4">
        <button
          class="px-6 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors cursor-pointer"
          @click="handleRetry"
        >
          {{ t('app.project.loadError.retry') }}
        </button>
        <router-link
          to="/"
          class="px-6 py-2 border border-edge text-ink rounded hover:bg-ink/5 transition-colors cursor-pointer"
        >
          {{ t('app.project.loadError.goHome') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
