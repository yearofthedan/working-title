import type { Logger, LogContext } from './types'
import { AppLogger } from './Logger'
import { devLogHandler, prodLogHandler } from './handlers'

let _logger: Logger | null = null

export function setGlobalLogger(logger: Logger): void {
  _logger = logger
}

export function getGlobalLogger(): Logger {
  if (!_logger) {
    _logger = new AppLogger(import.meta.env.DEV ? devLogHandler : prodLogHandler)
  }
  return _logger
}

export const logFatal = (error: Error, context?: LogContext) =>
  getGlobalLogger().fatal(error, context)
export const logError = (error: Error | string, context?: LogContext) =>
  getGlobalLogger().error(error, context)
export const logWarning = (message: string, context?: LogContext) =>
  getGlobalLogger().warning(message, context)
export const logInfo = (message: string, context?: LogContext) =>
  getGlobalLogger().info(message, context)

export function resetGlobalLogger(): void {
  _logger = null
}
