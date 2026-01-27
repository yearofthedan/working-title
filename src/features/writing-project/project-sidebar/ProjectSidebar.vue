<template>
  <aside class="w-75 flex flex-col bg-paper border-r border-edge transition-colors duration-300">
    <div class="p-4 border-b border-edge">
      <h2 class="text-xs font-bold uppercase tracking-widest text-ink/80">Project Context</h2>
    </div>
    <div class="p-4 overflow-y-auto flex-y gap-6 flex-1">
      <AppTextAreaField
        v-for="step in steps"
        :key="step.id"
        :model-value="step.content"
        :label="t(step.labelKey)"
        :placeholder="t(step.placeholderKey)"
        @update:model-value="(val) => updateContent(step.id, val)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import AppTextAreaField from '@/features/common/fields/AppTextAreaField.vue'
import { useSidebarViewModel } from './composables/useSidebarViewModel'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { steps, updateContent } = useSidebarViewModel()
</script>

<style></style>
