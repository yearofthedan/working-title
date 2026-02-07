<script setup lang="ts">
import { useClipboard, useBrowserLocation } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import AppIcon from '../AppIcon.vue'
import { refreshPage } from '@/utils/browsers'

const props = defineProps<{
  error: Error | null
}>()

const { t } = useI18n()
const location = useBrowserLocation()
const { copy, copied, isSupported } = useClipboard()

const handleRefresh = () => {
  refreshPage()
}

const copyDetails = () => {
  if (!props.error) return

  const text = `
Message: ${props.error.message}
Stack: ${props.error.stack}
URL: ${location.value.href}
Timestamp: ${new Date().toISOString()}
  `.trim()

  copy(text)
}
</script>

<template>
  <div class="bg-background fixed inset-0 z-9999 grid place-items-center p-6">
    <main
      role="alert"
      aria-live="assertive"
      class="flex max-w-xl flex-col items-center text-center"
    >
      <AppIcon name="error" class="text-error" />
      <h1 class="display-text mb-2">{{ t('errors.boundary.title') }}</h1>

      <p class="hint-text mb-8">
        {{ t('errors.boundary.message') }}
      </p>

      <nav class="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          class="bg-primary text-on-primary action-text cursor-pointer rounded-md px-6 py-3 transition-colors hover:opacity-90"
          @click="handleRefresh"
        >
          {{ t('errors.boundary.refresh') }}
        </button>
        <a
          href="/"
          class="action-text border-edge text-ink hover:bg-paper inline-flex items-center justify-center rounded-md border px-6 py-3 transition-colors"
        >
          {{ t('errors.boundary.goHome') }}
        </a>
      </nav>

      <details v-if="error" class="group mt-12 w-full text-left">
        <summary
          class="label-text flex cursor-pointer items-center justify-center gap-2 select-none hover:text-ink"
        >
          {{ t('errors.boundary.technical') }}
          <span class="transition-transform group-open:rotate-180">↓</span>
        </summary>

        <div class="border-edge bg-paper mt-4 rounded-md border p-4">
          <header class="mb-3 flex items-center justify-between">
            <span class="label-text">{{ t('errors.boundary.stackTitle') }}</span>

            <button
              v-if="isSupported"
              type="button"
              class="text-link hover:text-link-hover text-[10px] font-bold uppercase tracking-widest cursor-pointer"
              @click="copyDetails"
            >
              {{ copied ? t('errors.boundary.copied') : t('errors.boundary.copy') }}
            </button>
          </header>
          <pre class="code-text max-h-48 overflow-auto whitespace-pre-wrap break-all">{{
            error.stack || error.message
          }}</pre>
        </div>
      </details>
    </main>
  </div>
</template>
