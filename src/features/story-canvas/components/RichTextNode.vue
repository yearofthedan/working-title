<template>
  <div class="node-container">
    <div class="content nodrag">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  content: string
}>()

const emit = defineEmits<{
  (e: 'update:content', content: string): void
}>()

const editor = useEditor({
  content: props.content,
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    emit('update:content', editor.getHTML())
  },
})

watch(
  () => props.content,
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

<style scoped>
.node-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px;
  min-width: 200px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
}

.content {
  flex-grow: 1;
  /* Allows the content area to expand */
}
</style>
