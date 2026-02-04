import { generateId } from '@/utils/ids'
import { ref, inject, type InjectionKey, type Ref, type InjectionKey as VueInjectionKey } from 'vue'

export type NotificationsStore = {
  notifications: Ref<AppNotification[]>
  notify: (payload: Omit<AppNotification, 'id'>) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  remove: (notification: AppNotification) => void
}

type AppNotification = {
  id: string
  message: string
  type: 'success' | 'error' | 'warning'
  duration?: number
}

export const NOTIFICATIONS_KEY: InjectionKey<NotificationsStore> = Symbol('AppNotifications')

const notificationsStore = (): NotificationsStore => {
  const notifications = ref<AppNotification[]>([])

  const notify = (payload: Omit<AppNotification, 'id'>) => {
    const notification = { ...payload, id: generateId() }
    notifications.value.push(notification)

    if ((notification.duration || 0) > 0) {
      setTimeout(() => removeNotification(notification), notification.duration)
    }
  }

  const removeNotification = (notification: AppNotification) => {
    notifications.value = notifications.value.filter((n) => n.id !== notification.id)
  }

  return {
    notifications,
    notify,
    success: (message: string, duration?: number) => notify({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => notify({ type: 'error', message, duration }),
    warning: (message: string, duration?: number) => notify({ type: 'warning', message, duration }),
    remove: removeNotification,
  }
}

export function createNotificationsBinding(): [typeof NOTIFICATIONS_KEY, NotificationsStore] {
  const store = notificationsStore()
  return [NOTIFICATIONS_KEY, store]
}

export function provideNotifications(
  provider: (key: VueInjectionKey<unknown> | string, value: unknown) => void
) {
  provider(...createNotificationsBinding())
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
