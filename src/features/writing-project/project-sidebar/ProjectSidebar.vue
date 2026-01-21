<template>
  <aside class="w-75 flex flex-col bg-paper border-r border-edge transition-colors duration-300">
    <div class="p-4 border-b border-edge">
      <h2 class="text-xs font-bold uppercase tracking-widest text-ink/80">Project Context</h2>
    </div>
    <div class="p-4 overflow-y-auto flex-y gap-6 flex-1">
      <AppTextAreaField
        v-for="stepId in stepIds"
        :key="stepId"
        :model-value="getStepContent(stepId)"
        :label="getStepLabel(getStepIdByUid(stepId))"
        :placeholder="getStepPlaceholder(getStepIdByUid(stepId))"
        @update:model-value="(val) => updateContent(stepId, val)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import AppTextAreaField from '@/features/common/fields/AppTextAreaField.vue'
import { useProjectContent } from '../view-model/useProjectContext'
import { useDefinitionsContext } from '../view-model/useDefinitionsContext'
defineProps<{
  stepIds: string[]
}>()

const { contentMap, getContent, updateContent } = useProjectContent()
const { getStepDef } = useDefinitionsContext()

const getStepIdByUid = (id: string) => {
  return contentMap.value.get(id)?.stepId ?? ''
}

const getStepContent = (id: string) => {
  return getContent(id)?.content.text ?? ''
}

const getStepLabel = (stepId: string) => {
  return getStepDef(stepId)?.label ?? 'Unknown'
}

const getStepPlaceholder = (stepId: string) => {
  return getStepDef(stepId)?.placeholder ?? ''
}
</script>

<style></style>
