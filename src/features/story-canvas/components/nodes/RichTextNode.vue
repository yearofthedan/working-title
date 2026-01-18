<template>
  <div
    class="rounded-sm bg-paper border border-edge p-4 min-w-52 max-w-prose min-h-24 flex flex-col shadow-sm hover:shadow-md transition-all duration-300"
  >
    <div class="text-[10px] font-bold uppercase tracking-widest text-ink opacity-50 mb-2">
      {{ definition.label }}
      <span v-if="definition.category" class="ml-2 px-1 bg-edge/20 rounded-xs">
        {{ definition.category }}
      </span>
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
import { watch, onBeforeUnmount } from 'vue'
import { useDebouncedEmit } from '@/utils/useDebouncedEmit'
import type { RichTextNodeDefinition, RichTextNodeContent } from './types'

const props = defineProps<{
  id: string
  definition: RichTextNodeDefinition
  content: RichTextNodeContent
}>()

const emit = defineEmits<{
  (e: 'update:content', id: string, content: RichTextNodeContent): void
}>()

const { emit: emitContent, flush: flushContent } = useDebouncedEmit((newText: string) => {
  emit('update:content', props.id, {
    text: newText,
  })
})

const editor = useEditor({
  content: props.content.text,
  extensions: [StarterKit],
  editable: false,
  editorProps: {
    attributes: {
      role: 'textbox',
      placeholder: props.definition.placeholder ?? '',
    },
  },
  onUpdate: ({ editor: e }) => {
    const newContent = e.getHTML()
    if (newContent !== props.content.text) {
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

watch(
  () => props.content.text,
  (newText) => {
    if (editor.value && editor.value.getHTML() !== newText) {
      editor.value.commands.setContent(newText, { parseOptions: { preserveWhitespace: 'full' } })
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.ProseMirror:focus {
  outline: none;
}
</style>
