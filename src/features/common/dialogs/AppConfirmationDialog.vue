<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppSpinner from '@/features/common/feedback/AppSpinner.vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDangerous?: boolean
  isLoading?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const { t } = useI18n()
const dialogRef = ref<null | HTMLDialogElement>(null)

watch(
  () => props.modelValue,
  (isOpen) => {
    const dialog = dialogRef.value
    if (!dialog) return
    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  },
  { immediate: true }
)

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleConfirm() {
  emit('confirm')
}

function handleClose() {
  emit('update:modelValue', false)
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
        {{ title }}
      </h2>

      <p class="text-ink/80 leading-relaxed">
        {{ message }}
      </p>

      <div class="flex justify-end gap-3 mt-2">
        <button
          type="button"
          class="px-4 py-2 text-ink/60 hover:text-ink transition-colors cursor-pointer disabled:opacity-30"
          :disabled="isLoading"
          @click="handleCancel"
        >
          {{ cancelLabel || t('common.actions.cancel') }}
        </button>

        <button
          type="button"
          class="relative px-6 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[100px]"
          :class="[
            isDangerous
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-primary text-on-primary hover:bg-primary/90',
          ]"
          :disabled="isLoading"
          @click="handleConfirm"
        >
          <span :class="{ 'opacity-0': isLoading }">
            {{ confirmLabel || t('common.actions.confirm') }}
          </span>

          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
            <AppSpinner size="sm" />
          </div>
        </button>
      </div>
    </div>
  </dialog>
</template>
