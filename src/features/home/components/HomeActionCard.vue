<template>
  <component
    :is="to ? 'RouterLink' : 'button'"
    :to="to ? { name: to } : undefined"
    class="group w-64 h-64 bg-paper border border-edge rounded-sm flex flex-col items-center justify-center gap-4 transition-all hover:border-ink/20 hover:bg-ink/2 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
    :disabled="loading"
  >
    <span
      class="w-12 h-12 flex-center rounded-full bg-ink/5 group-hover:bg-ink/10 transition-colors text-xl text-ink/60 font-light"
    >
      <AppSpinner v-if="loading" size="sm" class="text-ink/40" />
      <slot v-else name="icon" />
    </span>
    <div class="text-center px-4">
      <span class="block text-lg font-medium text-ink">{{ title }}</span>
      <p class="text-xs text-ink/40">{{ description }}</p>
    </div>
  </component>
</template>

<script setup lang="ts">
import AppSpinner from '@/features/common/AppSpinner.vue'

defineProps<{
  title: string
  description: string
  to?: string
  loading?: boolean
}>()
</script>
