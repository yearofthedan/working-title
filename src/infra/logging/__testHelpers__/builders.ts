import type { LogEntry, LogContext, LogSeverity } from '../types'

export function buildLogEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  return {
    timestamp: new Date('2026-02-02T20:00:00Z'),
    severity: 'info' as LogSeverity,
    message: 'Test log message',
    environment: 'development',
    ...overrides,
  }
}

export function buildLogContext(overrides: Partial<LogContext> = {}): LogContext {
  return {
    feature: 'test-feature',
    operation: 'test-operation',
    ...overrides,
  }
}
