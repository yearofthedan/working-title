<template>
  <div
    v-if="isLoading"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    :aria-label="ariaLabel ?? message ?? 'Loading...'"
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
defineProps<{
  isLoading: boolean
  message?: string
  ariaLabel?: string
}>()
</script>
