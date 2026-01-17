import { useDebounceFn } from '@vueuse/core'
import { toValue, type MaybeRefOrGetter } from 'vue'

export interface UseDebouncedEmitOptions {
  delay?: MaybeRefOrGetter<number>
  maxWait?: MaybeRefOrGetter<number>
}

export interface UseDebouncedEmitReturn<T> {
  emit: (value: T) => void
  flush: () => void
}

export function useDebouncedEmit<T>(
  emitFn: (value: T) => void,
  options: UseDebouncedEmitOptions = {}
): UseDebouncedEmitReturn<T> {
  const { delay = 300, maxWait = 1000 } = options

  let pendingValue: T | null = null
  let hasPendingValue = false

  const debouncedEmit = useDebounceFn(
    (value: T) => {
      emitFn(value)
      hasPendingValue = false
      pendingValue = null
    },
    toValue(delay),
    { maxWait: toValue(maxWait) }
  )

  const emit = (value: T) => {
    pendingValue = value
    hasPendingValue = true
    debouncedEmit(value)
  }

  const flush = () => {
    if (hasPendingValue && pendingValue !== null) {
      emitFn(pendingValue)
      hasPendingValue = false
      pendingValue = null
    }
  }

  return {
    emit,
    flush,
  }
}
