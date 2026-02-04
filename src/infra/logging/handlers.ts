import type { LogEntry, LogHandler } from './types'

export const createDevLogHandler = (output: Console = console): LogHandler => {
  return (entry): void => {
    const { timestamp, severity, message, error, context, stackTrace } = entry
    const timeStr = timestamp.toISOString().replace('T', ' ').split('.')[0]

    const icons = {
      fatal: '🔴 FATAL',
      error: '🟠 ERROR',
      warning: '🟡 WARNING',
      info: '🔵 INFO',
    }

    const label = icons[severity] || severity.toUpperCase()
    const contextLabel = context?.operation ? ` | ${context.operation}` : ''

    output.groupCollapsed(`[${timeStr}] ${label}${contextLabel}`)
    output.log(`Message: ${message}`)

    if (error) {
      output.error(error)
    }

    if (stackTrace) {
      output.log('Stack Trace:\n', stackTrace)
    }

    if (context && Object.keys(context).length > 0) {
      output.log('Context:', context)
    }

    output.groupEnd()
  }
}
export const devLogHandler = createDevLogHandler()

export const createProdLogHandler = (output: Console = console) => {
  return (entry: LogEntry): void => {
    const { timestamp, severity, message } = entry
    const timeStr = timestamp.toLocaleTimeString()

    const prefix = severity === 'fatal' || severity === 'error' ? 'ERROR' : severity.toUpperCase()

    if (severity === 'fatal' || severity === 'error') {
      output.error(`[${timeStr}] ${prefix}: ${message}`)
    } else if (severity === 'warning') {
      output.warn(`[${timeStr}] ${prefix}: ${message}`)
    } else {
      output.info(`[${timeStr}] ${prefix}: ${message}`)
    }
  }
}

export const prodLogHandler = createProdLogHandler()
