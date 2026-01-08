<template>
  <div class="flex-y gap-2">
    <label v-if="label" :for="inputId" class="block label-text">
      {{ label }}
      <span v-if="required" aria-hidden="true" class="error-text">*</span>
    </label>

    <slot v-bind="slotAttrs" />

    <div v-if="hint" :id="hintId" class="hint-text" role="note">
      {{ hint }}
    </div>
    <div v-if="error" :id="errorId" class="error-text" role="alert" aria-live="polite">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{
  label?: string
  hint?: string
  error?: string
  required?: boolean
  invalid?: boolean
  describedBy?: string
  placeholder?: string
  id?: string
}>()

const inputId = useId() || props.id
const hintId = computed(() => `${inputId}-hint`)
const errorId = computed(() => `${inputId}-error`)

const isInvalid = computed(() => !!props.error || props.invalid === true)

const describedByIds = computed(() => {
  const ids = [
    props.describedBy,
    props.hint ? hintId.value : null,
    props.error ? errorId.value : null,
  ].filter(Boolean)

  return ids.length > 0 ? ids.join(' ') : undefined
})

const slotAttrs = computed(() => ({
  id: inputId,
  'aria-describedby': describedByIds.value,
  'aria-invalid': isInvalid.value || undefined,
  'aria-required': props.required || undefined,
  placeholder: props.placeholder,
}))
</script>
