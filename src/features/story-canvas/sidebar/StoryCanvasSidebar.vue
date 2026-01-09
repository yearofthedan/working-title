<template>
  <aside
    class="w-[300px] flex flex-col bg-paper border-r border-edge transition-colors duration-300"
  >
    <div class="p-4 border-b border-edge">
      <h2 class="text-xs font-bold uppercase tracking-widest text-ink/80">Project Context</h2>
    </div>
    <div class="p-4 overflow-y-auto flex-y gap-6 flex-1">
      <AppTextAreaField
        v-for="node in nodes"
        :key="node.id"
        :model-value="node.content"
        :label="node.label"
        @update:model-value="(val) => emit('update:content', { id: node.id, content: val })"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { SidebarNode } from '@features/story-canvas/types'
import AppTextAreaField from '@/features/common/fields/AppTextAreaField.vue'

defineProps<{
  nodes: SidebarNode[]
}>()
const emit = defineEmits<{
  (e: 'update:content', payload: { id: string; content: string }): void
}>()
</script>

<style></style>
