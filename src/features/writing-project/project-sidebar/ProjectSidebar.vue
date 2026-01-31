<template>
  <aside class="w-75 flex flex-col bg-paper border-r border-edge transition-colors duration-300">
    <header class="p-4 border-b border-edge flex-y gap-1">
      <div class="flex-h items-start justify-between gap-2">
        <h1 class="text-lg font-bold text-ink truncate" :title="projectName">
          {{ projectName }}
        </h1>
        <SaveStatusIndicator :status="saveStatus" :error="saveError" class="mt-1 shrink-0" />
      </div>
      <h2 class="text-xs font-bold uppercase tracking-widest text-ink/60">
        {{ t('writingProject.sidebar.contextTitle') }}
      </h2>
    </header>
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
import SaveStatusIndicator from '@/features/writing-project/components/SaveStatusIndicator.vue'
import { useSidebarViewModel } from './composables/useSidebarViewModel'
import { useI18n } from 'vue-i18n'
import { useActiveProjectContext } from '@/features/writing-project/composables/useActiveProjectContext'

const { t } = useI18n()
const { projectName, saveStatus, saveError } = useActiveProjectContext()
const { steps, updateContent } = useSidebarViewModel()
</script>

<style></style>
