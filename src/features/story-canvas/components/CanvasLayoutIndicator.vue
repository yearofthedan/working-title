<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="isLoading"
      class="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-2 rounded-md bg-paper/90 border border-edge shadow-lg backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        class="w-4 h-4 border-2 border-edge border-t-ink rounded-full animate-spin"
      ></div>
      <span class="text-xs font-medium text-ink/70">Updating layout...</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  isLoading: boolean
}>()
</script>
