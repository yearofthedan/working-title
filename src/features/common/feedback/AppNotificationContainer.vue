<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useNotifications } from '@/composables/useNotifications'
import AppIcon from '../AppIcon.vue'

const { t } = useI18n()
const { notifications, remove, pause, resume } = useNotifications()

const getAriaLabel = (type: string) => t(`app.notifications.types.${type}`)
</script>

<template>
  <section
    class="fixed top-4 right-4 z-50 pointer-events-none sm:top-6 sm:right-6"
    aria-label="Notifications"
  >
    <TransitionGroup
      tag="ul"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="flex flex-col items-end gap-3"
      move-class="transition-all duration-300"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      leave-active-class="transition-all duration-200 ease-in absolute w-full"
      leave-to-class="translate-x-full opacity-0"
    >
      <li
        v-for="notification in notifications"
        :key="notification.id"
        class="relative pointer-events-auto flex w-full max-w-(--spacing-100) gap-3 rounded-lg border border-edge bg-paper p-4 shadow-lg ring-1 ring-black/5"
        :class="{
          'border-error/20': notification.type === 'error',
          'border-warning/20': notification.type === 'warning',
          'border-success/20': notification.type === 'success',
        }"
        @mouseenter="pause(notification)"
        @mouseleave="resume(notification)"
        @focusin="pause(notification)"
        @focusout="resume(notification)"
      >
        <div class="shrink-0 pt-0.5" aria-hidden="true">
          <AppIcon
            :name="notification.type"
            class="h-5 w-5"
            :class="{
              'text-success': notification.type === 'success',
              'text-error': notification.type === 'error',
              'text-warning': notification.type === 'warning',
            }"
          />
        </div>

        <div class="flex-1 min-w-0">
          <p class="max-h-(--spacing-50) overflow-y-auto pr-2 text-sm leading-relaxed text-ink">
            <span class="sr-only">{{ getAriaLabel(notification.type) }}: </span>
            {{ notification.message }}
          </p>
        </div>

        <div class="shrink-0">
          <button
            type="button"
            class="inline-flex rounded-md p-1 text-ink-muted hover:bg-edge hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors cursor-pointer"
            @click="remove(notification)"
          >
            <span class="sr-only">{{ t('common.actions.close') }}</span>
            <AppIcon name="close" class="h-4 w-4" />
          </button>
        </div>
      </li>
    </TransitionGroup>
  </section>
</template>
