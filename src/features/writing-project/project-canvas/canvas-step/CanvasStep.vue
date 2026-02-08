<template>
  <article
    class="rounded-sm bg-paper border border-edge p-4 min-w-52 max-w-prose min-h-24 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 group"
    :aria-labelledby="`step-label-${props.id}`"
  >
    <div class="flex items-start justify-between mb-2 gap-2">
      <h3
        :id="`step-label-${props.id}`"
        class="text-[10px] font-bold uppercase tracking-widest text-ink opacity-50"
      >
        {{ t(definition.label) }}
        <span v-if="definition.category" class="ml-2 px-1 bg-edge/20 rounded-xs">
          {{ definition.category }}
        </span>
      </h3>
      <button
        class="p-1 -mr-2 -mt-2 rounded hover:bg-edge/20 text-ink/50 hover:text-ink transition-colors focus:outline-none focus:ring-1 focus:ring-primary nodrag opacity-0 group-hover:opacity-100"
        :aria-label="t('writingProject.canvas.actions.openInPanel')"
        @click.stop="emit('node-click', props.id)"
      >
        <AppIcon name="expand" class="text-sm" />
      </button>
    </div>
    <div
      class="content nodrag flex-1 overflow-x-hidden text-left text-sm leading-relaxed text-ink relative"
      :class="{
        'cursor-pointer': !editor?.isEditable,
        'min-h-70': isLargeScope,
      }"
    >
      <editor-content :editor="editor" />
      <!-- Overlay to capture clicks for non-editable states (inline editing toggle) -->
      <div
        v-if="!isLargeScope && !editor?.isEditable"
        class="absolute inset-0 z-10 cursor-pointer"
        @click="handleClick"
      />
    </div>

    <div
      v-if="actions && actions.length > 0"
      class="mt-4 flex flex-wrap gap-2 pt-3 border-t border-edge/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
    >
      <CanvasStepMenu
        v-for="action in actions"
        :key="action.id"
        :label="t(action.label)"
        @click="emit('action-click', action)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import AppIcon from '@/features/common/AppIcon.vue'
import CanvasStepMenu from './CanvasStepMenu.vue'
import { useStepEditor } from '../../composables/useStepEditor'
import type { CanvasStepProps, CanvasStepContent } from '../stepTypes'
import type { ActionDefinition } from '../../composables/useStepActions'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<CanvasStepProps>()

const emit = defineEmits<{
  (e: 'update:content', id: string, content: CanvasStepContent): void
  (e: 'action-click', action: ActionDefinition): void
  (e: 'node-click', id: string): void
}>()

const isLargeScope = computed(
  () => props.definition.scope === 'page' || props.definition.scope === 'multi-page'
)

const isEditable = ref(false)
const { editor } = useStepEditor({
  content: computed(() => props.content.text),
  editable: isEditable,
  placeholder: props.definition.placeholder,
  onUpdate: (newText) => {
    emit('update:content', props.id, {
      text: newText,
    })
  },
})

const handleClick = () => {
  if (editor.value && !editor.value.isEditable) {
    isEditable.value = true
    editor.value.commands.focus()
  }
}
</script>

<style>
.ProseMirror:focus {
  outline: none;
}
</style>
