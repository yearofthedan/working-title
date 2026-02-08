<template>
  <Transition name="panel-slide">
    <aside
      v-if="isOpen && activeStepId"
      class="fixed top-0 right-0 h-full w-[600px] bg-paper border-l border-edge shadow-2xl flex flex-col z-50"
      tabindex="-1"
    >
      <!-- Header -->
      <header class="flex items-center justify-between px-4 py-3 border-b border-edge bg-surface">
        <h2 v-if="definition" class="text-sm font-bold uppercase tracking-wider text-ink">
          {{ definition.labelText ? t(definition.labelText) : '' }}
        </h2>
        <button
          class="p-1 rounded-md hover:bg-edge/10 transition-colors text-ink/70 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary"
          :aria-label="t('common.actions.close')"
          @click="closePanel"
        >
          <AppIcon name="close" class="text-xl" />
        </button>
      </header>

      <!-- Content Area -->
      <div
        class="flex-1 overflow-y-auto bg-paper p-6"
        role="region"
        :aria-label="t('writingProject.detailPanel.contentArea')"
      >
        <div
          v-if="currentStep"
          class="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:mb-4"
        >
          <editor-content :editor="editor" />
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { EditorContent } from '@tiptap/vue-3'
import AppIcon from '@/features/common/AppIcon.vue'
import { useDetailPanel } from './useDetailPanel'
import { useDefinitionsContext } from '../composables/useDefinitionsContext'
import { useActiveProjectContext } from '../composables/useActiveProjectContext'
import { useStepEditor } from '../composables/useStepEditor'

const { t } = useI18n()
const { isOpen, activeStepId, closePanel } = useDetailPanel()
const { getStepDef } = useDefinitionsContext()
const { getContent, updateContent } = useActiveProjectContext()

const currentStep = computed(() => {
  if (!activeStepId.value) return null
  return getContent(activeStepId.value)
})

const definition = computed(() => {
  if (!currentStep.value) return null
  return getStepDef(currentStep.value.stepId)
})

const { editor } = useStepEditor({
  content: computed(() => currentStep.value?.content.text),
  onUpdate: (newContent) => {
    if (activeStepId.value) {
      updateContent(activeStepId.value, newContent)
    }
  },
})
</script>

<style scoped>
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
