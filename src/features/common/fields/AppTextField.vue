<template>
  <AppFieldWrapper
    :id="id"
    :label="label"
    :placeholder="placeholder"
    :described-by="describedBy"
    :required="required"
    :hint="hint"
    :error="error"
    :invalid="invalid"
  >
    <template #default="slotAttrs">
      <input
        v-bind="{ ...slotAttrs, ...$attrs }"
        v-model="modelValue"
        class="w-full field-text p-3 bg-ink/4 rounded-sm transition-colors border border-transparent focus:border-edge focus:outline-none ¬min-h-[3lh] aria-invalid:border-error aria-invalid:focus:border-error"
      />
    </template>
  </AppFieldWrapper>
</template>

<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import AppFieldWrapper from './AppFieldWrapper.vue'

defineOptions({
  inheritAttrs: false,
})

const modelValue = defineModel<string>({ required: true })

interface Props extends /* @vue-ignore */ InputHTMLAttributes {
  id?: string
  label?: string
  placeholder?: string
  describedBy?: string
  required?: boolean
  hint?: string
  error?: string
  invalid?: boolean
}

defineProps<Props>()
</script>
