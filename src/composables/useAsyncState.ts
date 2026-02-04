import { now } from '@/utils/dates'
import { ref, type Ref, onUnmounted, getCurrentInstance } from 'vue'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

type IdleState<T> = { status: 'idle'; data: T; error: null }
type LoadingState<T> = { status: 'loading'; data: T; error: null }
type ErrorState = { status: 'error'; data: null; error: Error }
type SuccessState<T> = { status: 'success'; data: T; error: null }

export type AsyncState<T> =
  | IdleState<T | null>
  | LoadingState<T | null>
  | SuccessState<T>
  | ErrorState

type Options<T> = {
  initial?: T
  rethrow?: boolean
}

type GuaranteedState<T> =
  | { status: 'idle' | 'loading' | 'success'; data: T; error: null }
  | { status: 'error'; data: T; error: Error }

export type UseAsyncStateReturn<T, Args extends unknown[], S> = {
  state: Ref<S>
  execute: (...args: Args) => Promise<T | undefined>
  lastSuccess: Ref<string | null>
  onSuccess: (cb: (data: T) => void) => void
  onError: (cb: (error: Error) => void) => void
}

export function useAsyncState<T, Args extends unknown[] = []>(
  promiseFn: (...args: Args) => Promise<T>,
  options: Options<T> & { initial: T }
): UseAsyncStateReturn<T, Args, GuaranteedState<T>>

export function useAsyncState<T, Args extends unknown[] = []>(
  promiseFn: (...args: Args) => Promise<T>,
  options?: Options<T>
): UseAsyncStateReturn<T, Args, AsyncState<T>>

export function useAsyncState<T, Args extends unknown[] = []>(
  promiseFn: (...args: Args) => Promise<T>,
  options: Options<T> = {}
) {
  const { initial = null, rethrow = false } = options
  const state = ref<AsyncState<T>>({ status: 'idle', data: initial, error: null })
  const lastSuccess = ref<string | null>(null)

  const successCallbacks = new Set<(data: T) => void>()
  const errorCallbacks = new Set<(error: Error) => void>()

  const execute = async (...args: Args) => {
    state.value = { status: 'loading', data: initial, error: null }
    try {
      const result = await promiseFn(...args)
      state.value = { status: 'success', data: result, error: null }
      lastSuccess.value = now()
      successCallbacks.forEach((cb) => cb(result))
      return result
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error')
      state.value = { status: 'error', data: null, error }
      errorCallbacks.forEach((cb) => cb(error))
      if (rethrow) {
        throw e
      }
      return undefined
    }
  }

  const registerCallback = <K>(set: Set<K>, cb: K) => {
    set.add(cb)
    if (getCurrentInstance()) {
      onUnmounted(() => {
        set.delete(cb)
      })
    }
  }

  return {
    state,
    execute,
    lastSuccess,
    onSuccess: (cb: (data: T) => void) => registerCallback(successCallbacks, cb),
    onError: (cb: (error: Error) => void) => registerCallback(errorCallbacks, cb),
  }
}
