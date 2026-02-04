import type { Logger, LogContext, LogEntry, LogSeverity, LogHandler } from './types'
export type { Logger, LogContext, LogEntry, LogSeverity }

export class AppLogger implements Logger {
  private handler: LogHandler
  constructor(handler: LogHandler) {
    this.handler = handler
  }
  private isDev = import.meta.env.DEV

  fatal(error: Error, context?: LogContext): void {
    this.log({
      severity: 'fatal',
      message: error.message,
      error,
      context,
      stackTrace: error.stack,
    })
  }

  error(error: Error | string, context?: LogContext): void {
    const isError = error instanceof Error
    this.log({
      severity: 'error',
      message: isError ? error.message : error,
      error: isError ? error : undefined,
      context,
      stackTrace: isError ? error.stack : undefined,
    })
  }

  warning(message: string, context?: LogContext): void {
    this.log({
      severity: 'warning',
      message,
      context,
    })
  }

  info(message: string, context?: LogContext): void {
    this.log({
      severity: 'info',
      message,
      context,
    })
  }

  private log(params: {
    severity: LogSeverity
    message: string
    error?: Error
    context?: LogContext
    stackTrace?: string
  }): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      severity: params.severity,
      message: params.message,
      error: params.error,
      context: params.context,
      stackTrace: params.stackTrace,
      environment: this.isDev ? 'development' : 'production',
    }

    this.handler(entry)
  }
}
