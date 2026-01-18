<template>
  <button
    type="button"
    :disabled="disabled"
    class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs border border-edge bg-paper text-ink-muted hover:text-ink hover:bg-edge/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>
