<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCanvasRootActions } from '@/features/process-templates/actions'
import { useDefinitionsContext } from '@/features/writing-project/composables/useDefinitionsContext'
import {
  useProjectContent,
  useProjectMutations,
} from '@/features/writing-project/composables/useActiveProjectContext'

const { t } = useI18n()
const { template } = useDefinitionsContext()
const { contentMap } = useProjectContent()
const { addStep } = useProjectMutations()

const availableActions = computed(() =>
  getCanvasRootActions(template.value, Array.from(contentMap.value.values()))
)

const handleAddStep = (stepId: string) => {
  addStep(stepId)
}
</script>

<template>
  <div
    class="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-background"
  >
    <div class="mb-4 text-edge">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mx-auto"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    </div>
    <h3 class="text-xl font-bold mb-2 text-ink">{{ t('app.canvas.emptyState.title') }}</h3>
    <p class="max-w-md text-ink-muted mb-6">
      {{ t('app.canvas.emptyState.description') }}
    </p>

    <div v-if="availableActions.length > 0" class="flex flex-col gap-3">
      <button
        v-for="action in availableActions"
        :key="action.id"
        class="px-6 py-3 bg-accent text-white dark:bg-accent dark:text-white font-medium rounded-lg hover:bg-accent-hover transition-colors cursor-pointer shadow-md"
        @click="handleAddStep(action.targetType)"
      >
        {{ t(action.labelText) }}
      </button>
    </div>

    <p
      v-else-if="
        Array.from(contentMap.values()).some((s) =>
          template.stepDefinitions
            .find((sd) => sd.id === s.stepId)
            ?.ui.visibility.includes('canvas')
        )
      "
      class="text-sm text-ink-muted"
    >
      {{ t('app.canvas.emptyState.allStepsAdded') }}
    </p>
  </div>
</template>
