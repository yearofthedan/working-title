export type LogSeverity = 'fatal' | 'error' | 'warning' | 'info'

export interface LogContext {
  [key: string]: unknown
  feature?: string
  projectId?: string
  stepId?: string
  operation?: string
  source?: 'vue' | 'window' | 'promise'
  showToast?: boolean
}

export interface LogEntry {
  timestamp: Date
  severity: LogSeverity
  message: string
  error?: Error
  context?: LogContext
  stackTrace?: string
  environment: 'development' | 'production'
}

export interface Logger {
  fatal(error: Error, context?: LogContext): void
  error(error: Error | string, context?: LogContext): void
  warning(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
}

export type LogHandler = (entry: LogEntry) => void
