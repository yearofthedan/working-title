<template>
  <aside
    class="w-[300px] flex flex-col bg-paper border-r border-edge transition-colors duration-300"
  >
    <div class="p-4 border-b border-edge">
      <h2 class="text-xs font-bold uppercase tracking-widest text-ink/80">Project Context</h2>
    </div>
    <div class="p-4 overflow-y-auto flex-y gap-6 flex-1">
      <AppTextAreaField
        v-for="(node, index) in sidebarNodes"
        :key="node.id"
        v-model="sidebarNodes[index]!.content"
        :label="node.label"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { SidebarNode } from '@features/story-canvas/types'
import AppTextAreaField from '@/features/common/fields/AppTextAreaField.vue'

const sidebarNodes = defineModel<SidebarNode[]>({ required: true })
</script>

<style></style>
