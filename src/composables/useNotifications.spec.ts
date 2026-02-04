import { describe, expect, vi, beforeEach } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'

import { useNotifications } from './useNotifications'
import { generateId } from '@/utils/ids'
import { runWithComponent } from '@/__testHelpers__/renderer'

vi.mock('@/utils/ids', () => ({
  generateId: vi.fn(),
}))

describe('useNotifications', () => {
  it.scoped({ globalMocks: ['logging'] })
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it('starts with an empty list of notifications', () => {
    const store = runWithComponent(() => useNotifications())
    expect(store.notifications.value).toEqual([])
  })

  it('adds a notification with default duration when success is called', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValue('test-id')

    store.success('Project saved')

    expect(store.notifications.value).toEqual([
      expect.objectContaining({
        id: 'test-id',
        message: 'Project saved',
        type: 'success',
        duration: 4000,
      }),
    ])
  })

  it('adds a warning notification with default duration when warning is called', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValue('warn-id')

    store.warning('Check your input')

    expect(store.notifications.value).toEqual([
      expect.objectContaining({
        id: 'warn-id',
        message: 'Check your input',
        type: 'warning',
        duration: 6000,
      }),
    ])
  })

  it('adds an error notification with default duration when error is called', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValue('error-id')

    store.error('Operation failed')

    expect(store.notifications.value).toEqual([
      expect.objectContaining({
        id: 'error-id',
        message: 'Operation failed',
        type: 'error',
        duration: 8000,
      }),
    ])
  })

  it('maintains multiple notifications in the order they were added', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2')

    store.success('First')
    store.error('Second')

    expect(store.notifications.value).toEqual([
      expect.objectContaining({ id: 'id-1', message: 'First', type: 'success' }),
      expect.objectContaining({ id: 'id-2', message: 'Second', type: 'error' }),
    ])
  })

  it('removes a specific notification when requested', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2')
    store.success('First')
    store.success('Second')

    store.remove(store.notifications.value[0]!)

    expect(store.notifications.value).toEqual([
      expect.objectContaining({ id: 'id-2', message: 'Second', type: 'success' }),
    ])
  })

  it('automatically clears a notification after its duration has elapsed', () => {
    const store = runWithComponent(() => useNotifications())

    store.error('Network Error', 1000)
    expect(store.notifications.value[0]?.duration).toBe(1000)
    expect(store.notifications.value).toHaveLength(1)

    vi.advanceTimersByTime(1000)
    expect(store.notifications.value).toHaveLength(0)
  })

  it('automatically clears a success notification after default duration (4s)', () => {
    const store = runWithComponent(() => useNotifications())

    store.success('Done')
    expect(store.notifications.value).toHaveLength(1)

    vi.advanceTimersByTime(3999)
    expect(store.notifications.value).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(store.notifications.value).toHaveLength(0)
  })

  it('pauses and resumes the timer correctly', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValue('test-id')

    store.success('Test', 4000)
    const notification = store.notifications.value[0]!

    vi.advanceTimersByTime(1000)
    store.pause(notification)

    vi.advanceTimersByTime(5000)
    expect(store.notifications.value).toHaveLength(1)

    store.resume(notification)
    vi.advanceTimersByTime(2999)
    expect(store.notifications.value).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(store.notifications.value).toHaveLength(0)
  })

  it('throws a descriptive error if the hook is called without a provider', () => {
    expect(() =>
      runWithComponent(() => useNotifications(), {
        global: { provide: {} },
      })
    ).toThrow('useNotifications() must be called inside a component')
  })
})
