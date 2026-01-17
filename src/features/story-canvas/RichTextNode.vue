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
import { useDebounceFn } from '@vueuse/core'
import { watch, onBeforeUnmount } from 'vue'
import type { CanvasNode } from '@/features/story-canvas/composables/useProjectViewModel'

const CONTENT_UPDATE_DEBOUNCE = 300

const props = defineProps<{
  data: CanvasNode
}>()
const emit = defineEmits<{
  (e: 'update:content', content: string): void
}>()

const debouncedEmit = useDebounceFn(
  (content: string) => {
    emit('update:content', content)
  },
  CONTENT_UPDATE_DEBOUNCE,
  { maxWait: 1000 }
)

let latestContent: string | null = null

const editor = useEditor({
  content: props.data.content,
  extensions: [StarterKit],
  editable: false,
  onUpdate: ({ editor: e }) => {
    const newContent = e.getHTML()
    if (newContent !== props.data.content) {
      latestContent = newContent
      debouncedEmit(newContent)
    }
  },
  onBlur: () => {
    if (latestContent && latestContent !== props.data.content) {
      emit('update:content', latestContent)
      latestContent = null
    }
  },
})

const makeEditable = () => {
  if (editor.value && !editor.value.isEditable) {
    editor.value.setEditable(true)
    editor.value.commands.focus()
  }
}

watch(
  () => props.data.content,
  (newContent) => {
    if (editor.value && editor.value.getHTML() !== newContent) {
      editor.value.commands.setContent(newContent, { parseOptions: { preserveWhitespace: 'full' } })
    }
  }
)

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
