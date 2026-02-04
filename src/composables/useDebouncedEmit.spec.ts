import { describe, expect, vi, beforeEach, afterEach } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { useDebouncedEmit } from './useDebouncedEmit'

describe('useDebouncedEmit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('debounces multiple rapid emissions', () => {
    const emitFn = vi.fn()
    const { emit } = useDebouncedEmit(emitFn, { delay: 300 })

    emit('value1')
    emit('value2')
    emit('value3')

    expect(emitFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(emitFn).toHaveBeenCalledTimes(1)
    expect(emitFn).toHaveBeenCalledWith('value3')
  })

  it('flushes pending value immediately', () => {
    const emitFn = vi.fn()
    const { emit, flush } = useDebouncedEmit(emitFn, { delay: 300 })

    emit('pending')

    expect(emitFn).not.toHaveBeenCalled()

    flush()

    expect(emitFn).toHaveBeenCalledTimes(1)
    expect(emitFn).toHaveBeenCalledWith('pending')
  })

  it('does not emit on flush if no pending value', () => {
    const emitFn = vi.fn()
    const { flush } = useDebouncedEmit(emitFn)

    flush()

    expect(emitFn).not.toHaveBeenCalled()
  })

  it('respects maxWait option', () => {
    const emitFn = vi.fn()
    const { emit } = useDebouncedEmit(emitFn, { delay: 300, maxWait: 500 })

    emit('value1')
    vi.advanceTimersByTime(200)
    emit('value2')
    vi.advanceTimersByTime(200)
    emit('value3')
    vi.advanceTimersByTime(200)

    expect(emitFn).toHaveBeenCalledTimes(1)
    expect(emitFn).toHaveBeenCalledWith('value3')
  })
})
