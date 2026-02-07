<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import AppError from './AppError.vue'
import { useLogger } from '@/composables/useLogger'

const { fatal: logFatal } = useLogger()
const error = ref<Error | null>(null)
onErrorCaptured((err: Error) => {
  error.value = err
  //TODO modify to allow additional message context
  logFatal(err)
  return false
})
</script>

<template>
  <AppError v-if="error" :error="error" />

  <slot v-else />
</template>
