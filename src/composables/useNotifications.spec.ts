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

  it('adds a notification when success is called', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValue('test-id')

    store.success('Project saved')

    expect(store.notifications.value).toEqual([
      { id: 'test-id', message: 'Project saved', type: 'success' },
    ])
  })

  it('adds a warning notification when warning is called', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValue('warn-id')

    store.warning('Check your input')

    expect(store.notifications.value).toEqual([
      { id: 'warn-id', message: 'Check your input', type: 'warning' },
    ])
  })

  it('maintains multiple notifications in the order they were added', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2')

    store.success('First')
    store.error('Second')

    expect(store.notifications.value).toEqual([
      { id: 'id-1', message: 'First', type: 'success' },
      { id: 'id-2', message: 'Second', type: 'error' },
    ])
  })

  it('removes a specific notification when requested', () => {
    const store = runWithComponent(() => useNotifications())
    vi.mocked(generateId).mockReturnValueOnce('id-1').mockReturnValueOnce('id-2')
    store.success('First')
    store.success('Second')

    store.remove(store.notifications.value[0]!)

    expect(store.notifications.value).toEqual([{ id: 'id-2', message: 'Second', type: 'success' }])
  })

  it('automatically clears a notification after its duration has elapsed', () => {
    const store = runWithComponent(() => useNotifications())

    store.error('Network Error', 1000)
    expect(store.notifications.value).toHaveLength(1)

    vi.advanceTimersByTime(1000)
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
