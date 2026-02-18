import { watch, onBeforeUnmount, type Ref } from 'vue'
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { useDebouncedEmit } from '@/features/common/composables/useDebouncedEmit'

export interface UseStepEditorOptions {
  content: Ref<string | undefined>
  onUpdate: (content: string) => void
  placeholder?: string
  editable?: Ref<boolean>
}

export function useStepEditor(options: UseStepEditorOptions) {
  const { emit: emitContent, flush: flushContent } = useDebouncedEmit(options.onUpdate)

  const editor = useEditor({
    content: options.content.value ?? '',
    extensions: [StarterKit],
    editable: options.editable?.value ?? true,
    editorProps: {
      attributes: {
        role: 'textbox',
        class: 'focus:outline-none',
        placeholder: options.placeholder ?? '',
      },
    },
    onUpdate: ({ editor: e }) => {
      const newContent = e.getHTML()
      if (newContent !== options.content.value) {
        emitContent(newContent)
      }
    },
    onBlur: () => {
      flushContent()
    },
  })

  // Sync editor content when external content changes (e.g. switching steps or remote update)
  watch(
    () => options.content.value,
    (newText) => {
      if (editor.value && editor.value.getHTML() !== newText) {
        editor.value.commands.setContent(newText ?? '', {
          parseOptions: { preserveWhitespace: 'full' },
        })
      }
    }
  )

  // Sync editable state
  if (options.editable) {
    watch(
      () => options.editable?.value,
      (isEditable) => {
        editor.value?.setEditable(isEditable ?? true)
      }
    )
  }

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return {
    editor,
    flushContent,
  }
}
