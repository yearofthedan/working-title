import { now } from '@/utils/dates'
import { ref, type Ref } from 'vue'

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
type Options<T> = { initial?: T }

type GuaranteedState<T> =
  | { status: 'idle' | 'loading' | 'success'; data: T; error: null }
  | { status: 'error'; data: T; error: Error }

// Guarantees that the state is returned if initially provided
export function useAsyncState<T, Args extends unknown[] = []>(
  promiseFn: (...args: Args) => Promise<T>,
  options?: Options<T> & { initial: T }
): {
  state: Ref<GuaranteedState<T>>
  execute: (...args: Args) => Promise<T>
  lastSuccess: Ref<string | null>
}

// Initial state is null if not initially provided
export function useAsyncState<T, Args extends unknown[] = []>(
  promiseFn: (...args: Args) => Promise<T>,
  option?: Options<T>
): {
  state: Ref<AsyncState<T>>
  execute: (...args: Args) => Promise<T>
  lastSuccess: Ref<string | null>
}

export function useAsyncState<T, Args extends unknown[] = []>(
  promiseFn: (...args: Args) => Promise<T>,
  options: Options<T> = {}
) {
  const { initial = null } = options
  const state = ref<AsyncState<T>>({ status: 'idle', data: initial, error: null })
  const lastSuccess = ref<string | null>(null)

  const execute = async (...args: Args) => {
    state.value = { status: 'loading', data: initial, error: null }
    try {
      const result = await promiseFn(...args)
      state.value = { status: 'success', data: result, error: null }
      lastSuccess.value = now()
      return result
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error')
      state.value = { status: 'error', data: null, error }
      throw e
    }
  }

  return { state, execute, lastSuccess }
}
