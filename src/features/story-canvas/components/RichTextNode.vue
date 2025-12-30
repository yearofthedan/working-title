<template>
  <div
    class="rounded-xl bg-white dark:bg-slate-900 p-4 min-w-52 max-w-prose min-h-24 flex flex-col shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300"
  >
    <div
      class="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2"
    >
      {{ data.label }}
    </div>
    <div
      class="content nodrag flex-1 overflow-x-hidden text-left text-sm leading-relaxed text-gray-900 dark:text-gray-100"
    >
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch, onBeforeUnmount } from 'vue'
import type { NodeData } from '@features/story-canvas/layout/trackLayout'

const props = defineProps<{
  data: NodeData
}>()

const emit = defineEmits<{
  (e: 'update:content', content: string): void
}>()

const editor = useEditor({
  content: props.data.content,
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    emit('update:content', editor.getHTML())
  },
})

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

<style scoped></style>
