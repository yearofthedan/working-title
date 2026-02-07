<template>
  <div
    v-if="isLoading"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    :aria-label="message ?? t('app.loading.message')"
    class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-paper"
  >
    <div
      aria-hidden="true"
      class="w-12 h-12 border-2 border-edge border-t-ink rounded-full animate-spin mb-4"
    ></div>
    <p v-if="message" class="text-sm text-ink/60">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  isLoading: boolean
  message?: string
}>()
</script>
