<template>
  <aside class="w-75 flex flex-col bg-paper border-r border-edge transition-colors duration-300">
    <div class="p-4 border-b border-edge">
      <h2 class="text-xs font-bold uppercase tracking-widest text-ink/80">Project Context</h2>
    </div>
    <div class="p-4 overflow-y-auto flex-y gap-6 flex-1">
      <AppTextAreaField
        v-for="node in nodes"
        :key="node.id"
        :model-value="getNodeContent(node.id)"
        :label="getNodeLabel(node.stepId)"
        :placeholder="getNodePlaceholder(node.stepId)"
        @update:model-value="(val) => updateContent(node.id, val)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { SidebarNode } from '@/features/story-canvas/types'
import AppTextAreaField from '@/features/common/fields/AppTextAreaField.vue'
import { useContentContext } from '@/features/story-canvas/composables/useContentContext'
import { useDefinitionsContext } from '@/features/story-canvas/composables/useDefinitionsContext'

defineProps<{
  nodes: SidebarNode[]
}>()

const { getContent, updateContent } = useContentContext()
const { getStepDef } = useDefinitionsContext()

const getNodeContent = (id: string) => {
  return getContent(id)?.content.text ?? ''
}

const getNodeLabel = (stepId: string) => {
  return getStepDef(stepId)?.label ?? 'Unknown'
}

const getNodePlaceholder = (stepId: string) => {
  return getStepDef(stepId)?.placeholder ?? ''
}
</script>

<style></style>
