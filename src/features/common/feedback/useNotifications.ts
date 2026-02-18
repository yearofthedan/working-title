import { generateId } from '@/utils/ids'
import { timestamp } from '@/utils/dates'
import { ref, inject, type InjectionKey, type Ref, type InjectionKey as VueInjectionKey } from 'vue'

export type NotificationsStore = {
  notifications: Ref<AppNotification[]>
  notify: (payload: Omit<AppNotification, 'id'>) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  remove: (notification: AppNotification) => void
  pause: (notification: AppNotification) => void
  resume: (notification: AppNotification) => void
}

export type AppNotification = {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
  duration?: number
  remaining?: number
  startedAt?: number
  timerId?: ReturnType<typeof setTimeout>
}

export const NOTIFICATIONS_KEY: InjectionKey<NotificationsStore> = Symbol('AppNotifications')

const DEFAULT_DURATIONS = {
  success: 4000,
  warning: 6000,
  error: 8000,
} as const

const notificationsStore = (): NotificationsStore => {
  const notifications = ref<AppNotification[]>([])

  const notify = (payload: Omit<AppNotification, 'id'>) => {
    const notification: AppNotification = { ...payload, id: generateId() }
    notifications.value.push(notification)

    if (notification.duration && notification.duration > 0) {
      startTimer(notification, notification.duration)
    }
  }

  const startTimer = (notification: AppNotification, duration: number) => {
    notification.remaining = duration
    notification.startedAt = timestamp()
    notification.timerId = setTimeout(() => removeNotification(notification), duration)
  }

  const pauseTimer = (notification: AppNotification) => {
    const existing = notifications.value.find((n) => n.id === notification.id)
    if (!existing || !existing.timerId || !existing.remaining || !existing.startedAt) return

    clearTimeout(existing.timerId)
    existing.timerId = undefined
    existing.remaining -= timestamp() - existing.startedAt
  }

  const resumeTimer = (notification: AppNotification) => {
    const existing = notifications.value.find((n) => n.id === notification.id)
    if (!existing || existing.timerId || !existing.remaining || existing.remaining <= 0) return

    existing.startedAt = timestamp()
    existing.timerId = setTimeout(() => removeNotification(existing), existing.remaining)
  }

  const removeNotification = (notification: AppNotification) => {
    const existing = notifications.value.find((n) => n.id === notification.id)

    if (existing?.timerId) {
      clearTimeout(existing.timerId)
    }
    notifications.value = notifications.value.filter((n) => n.id !== notification.id)
  }

  return {
    notifications,
    notify,
    success: (message: string, duration?: number) =>
      notify({ type: 'success', message, duration: duration ?? DEFAULT_DURATIONS.success }),
    error: (message: string, duration?: number) =>
      notify({ type: 'error', message, duration: duration ?? DEFAULT_DURATIONS.error }),
    warning: (message: string, duration?: number) =>
      notify({ type: 'warning', message, duration: duration ?? DEFAULT_DURATIONS.warning }),
    remove: removeNotification,
    pause: pauseTimer,
    resume: resumeTimer,
  }
}

export function createNotificationsBinding(): [typeof NOTIFICATIONS_KEY, NotificationsStore] {
  const store = notificationsStore()
  return [NOTIFICATIONS_KEY, store]
}

export function provideNotifications(
  provider: (key: VueInjectionKey<unknown> | string, value: unknown) => void
): [typeof NOTIFICATIONS_KEY, NotificationsStore] {
  const binding = createNotificationsBinding()
  provider(...binding)
  return binding
}

export function useNotifications(): NotificationsStore {
  const store = inject(NOTIFICATIONS_KEY)
  if (!store) {
    throw new Error(
      'useNotifications() must be called inside a component provided with provideAppNotifications()'
    )
  }
  return store
}