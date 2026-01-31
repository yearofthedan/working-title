<template>
  <div
    class="flex-h items-center gap-1.5 transition-opacity duration-300"
    :class="{ 'opacity-60': status === 'success', 'opacity-100': status !== 'success' }"
    :title="status === 'error' ? error?.message : undefined"
  >
    <!-- Success / Idle -->
    <template v-if="status === 'success' || status === 'idle'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-3.5 text-green-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span class="text-xs font-medium text-ink/70">
        {{ t('writingProject.saveStatus.saved') }}
      </span>
    </template>

    <!-- Loading -->
    <template v-else-if="status === 'loading'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-3.5 animate-spin text-ink/40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      </svg>
      <span class="text-xs font-medium text-ink/70">
        {{ t('writingProject.saveStatus.saving') }}
      </span>
    </template>

    <!-- Error -->
    <template v-else-if="status === 'error'">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="size-3.5 text-red-600"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span class="text-xs font-medium text-red-600">
        {{ t('writingProject.saveStatus.error') }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AsyncStatus } from '@/composables/useAsyncState'

defineProps<{
  status: AsyncStatus
  error?: Error | null
}>()

const { t } = useI18n()
</script>

