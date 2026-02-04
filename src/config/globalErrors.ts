import { getGlobalLogger } from '@/infra/logging/globals'
import type { App } from 'vue'

export const setupGlobalErrorHandling = (app: App) => {
  const logger = getGlobalLogger()
  // Unhandled Vue errors
  app.config.errorHandler = (err, instance, info) => {
    logger.fatal(err as Error, {
      source: 'vue',
      info,
      component: instance?.$options.name,
    })
  }

  // Unhandled JavaScript errors
  window.onerror = (message, source, lineno, colno, error) => {
    logger.fatal(error || new Error(String(message)), {
      source: 'window',
      location: { source, lineno, colno },
    })
  }

  // Unhandled Promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error(event.reason, { source: 'promise' })
  })
}
