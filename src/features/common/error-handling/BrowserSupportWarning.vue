<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { browserSupport } from '@/utils/browsers'

const { t } = useI18n()
const isSupported = browserSupport.supportsFilePicker()
</script>

<template>
  <div
    v-if="!isSupported"
    class="w-full bg-amber-50 border-b border-amber-200 p-4 flex justify-center"
    role="alert"
  >
    <div class="max-w-4xl w-full flex gap-3 text-amber-900">
      <span class="text-xl select-none" aria-hidden="true">⚠️</span>
      <div class="flex flex-col gap-1">
        <h2 class="text-sm font-bold tracking-wide uppercase">
          {{ t('browserSupport.warning.title') }}
        </h2>
        <p class="text-sm opacity-90">
          {{ t('browserSupport.warning.message') }}
        </p>
        <p class="text-xs font-medium opacity-80 italic">
          {{ t('browserSupport.warning.limitation') }}
        </p>
      </div>
    </div>
  </div>
</template>
