<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppTextField from '@/features/common/fields/AppTextField.vue'
import AppSpinner from '@/features/common/feedback/AppSpinner.vue'

const props = defineProps<{
  modelValue: boolean
  loading?: boolean
}>()
const emit = defineEmits(['update:modelValue', 'create'])

const { t } = useI18n()
const projectName = ref('')
const dialogRef = ref<null | HTMLDialogElement>(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    const dialog = dialogRef.value
    if (!dialog) return
    if (isOpen) {
      projectName.value = ''
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  },
  { immediate: true }
)

function handleCancel() {
  emit('update:modelValue', false)
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleCreate() {
  if (projectName.value.trim() && !props.loading) {
    emit('create', projectName.value.trim())
  }
}
</script>
<template>
  <dialog
    ref="dialogRef"
    class="bg-paper border border-edge rounded-sm shadow-xl w-full max-w-md p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:flex flex-col gap-6 fixed inset-0 m-auto transition-all duration-300 opacity-0 scale-95 open:opacity-100 open:scale-100"
    @close="handleClose"
  >
    <div class="p-6 flex flex-col gap-6 w-full">
      <h2 class="text-2xl font-serif italic text-ink">
        {{ t('app.home.newProject.dialog.title') }}
      </h2>

      <form class="flex flex-col gap-6" @submit.prevent="handleCreate">
        <AppTextField
          v-model="projectName"
          :label="t('app.home.newProject.dialog.nameLabel')"
          :placeholder="t('app.home.newProject.dialog.namePlaceholder')"
          auto-focus
          required
          :disabled="loading"
        />

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 text-ink/60 hover:text-ink transition-colors cursor-pointer disabled:opacity-30"
            :disabled="loading"
            @click="handleCancel"
          >
            {{ t('common.actions.cancel') }}
          </button>

          <button
            type="submit"
            class="relative px-6 py-2 bg-ink text-paper rounded-sm hover:bg-ink/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[100px]"
            :disabled="!projectName.trim() || loading"
          >
            <span :class="{ 'opacity-0': loading }">
              {{ t('app.home.newProject.dialog.create') }}
            </span>

            <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
              <AppSpinner size="sm" />
            </div>
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>
