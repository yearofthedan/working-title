import { inject, type InjectionKey, provide } from 'vue'
import { type Logger } from '@/infra/logging/Logger'
import { getGlobalLogger } from '@/infra/logging/globals'

export const LOGGER_KEY: InjectionKey<Logger> = Symbol('Logger')

export function createLoggerBinding(customLogger?: Logger): [typeof LOGGER_KEY, Logger] {
  return [LOGGER_KEY, customLogger ?? getGlobalLogger()]
}

export function provideLogger(provider: typeof provide) {
  const [key, logger] = createLoggerBinding()

  provider(key, logger)
  return logger
}

export function useLogger(): Logger {
  const contextLogger = inject(LOGGER_KEY, getGlobalLogger())
  return contextLogger
}
