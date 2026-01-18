<template>
  <div
    class="rounded-sm bg-paper border border-edge p-4 min-w-52 max-w-prose min-h-24 flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div class="text-[10px] font-bold uppercase tracking-widest text-ink opacity-50 mb-2">
      {{ data.label }}
    </div>
    <div
      class="content nodrag flex-1 overflow-x-hidden text-left text-sm leading-relaxed text-ink"
      :class="{ 'cursor-pointer': !editor?.isEditable }"
      @click="makeEditable"
    >
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch, onBeforeUnmount, computed } from 'vue'
import type { CanvasNode } from '@/features/story-canvas/composables/useProjectViewModel'
import { useDebouncedEmit } from '@/utils/useDebouncedEmit'
import { useContentContext } from '@/features/story-canvas/composables/useContentContext'

const CONTENT_UPDATE_DEBOUNCE = 300

const props = defineProps<{
  data: CanvasNode
}>()

const { getContent, updateContent } = useContentContext()

const nodeContent = computed(() => {
  return getContent(props.data.id)?.content.text ?? ''
})

const { emit: emitContent, flush: flushContent } = useDebouncedEmit(
  (content: string) => {
    updateContent(props.data.id, content)
  },
  { delay: CONTENT_UPDATE_DEBOUNCE, maxWait: 1000 }
)

const editor = useEditor({
  content: nodeContent.value,
  extensions: [StarterKit],
  editable: false,
  onUpdate: ({ editor: e }) => {
    const newContent = e.getHTML()
    if (newContent !== nodeContent.value) {
      emitContent(newContent)
    }
  },
  onBlur: () => {
    flushContent()
  },
})

const makeEditable = () => {
  if (editor.value && !editor.value.isEditable) {
    editor.value.setEditable(true)
    editor.value.commands.focus()
  }
}

watch(nodeContent, (newContent) => {
  if (editor.value && editor.value.getHTML() !== newContent) {
    editor.value.commands.setContent(newContent, { parseOptions: { preserveWhitespace: 'full' } })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
/* Remove default Tiptap focus ring to keep it clean */
.ProseMirror:focus {
  outline: none;
}
</style>
