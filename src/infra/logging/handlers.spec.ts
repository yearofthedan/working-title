import { describe, expect, vi, beforeEach } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { createDevLogHandler, createProdLogHandler } from './handlers'
import { buildLogEntry, buildLogContext } from './__testHelpers__/builders'

describe('Logging Handlers', () => {
  let mockConsole: Console

  beforeEach(() => {
    mockConsole = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      groupCollapsed: vi.fn(),
      groupEnd: vi.fn(),
    } as unknown as Console
  })

  describe('DevLogHandler', () => {
    it('formats a dev log with icons and collapsible group', () => {
      const handler = createDevLogHandler(mockConsole)
      const entry = buildLogEntry({
        severity: 'info',
        message: 'Hello Dev',
        timestamp: new Date('2026-02-04T12:00:00Z'),
        context: buildLogContext({ operation: 'test-op' }),
      })

      handler(entry)

      expect(mockConsole.groupCollapsed).toHaveBeenCalledWith(
        expect.stringContaining('[2026-02-04 12:00:00] 🔵 INFO | test-op')
      )
      expect(mockConsole.log).toHaveBeenCalledWith('Message: Hello Dev')
      expect(mockConsole.log).toHaveBeenCalledWith('Context:', entry.context)
      expect(mockConsole.groupEnd).toHaveBeenCalled()
    })

    it('includes error and stack trace if present', () => {
      const handler = createDevLogHandler(mockConsole)
      const error = new Error('Boom')
      const entry = buildLogEntry({
        severity: 'fatal',
        error,
        stackTrace: 'custom stack',
      })

      handler(entry)

      expect(mockConsole.error).toHaveBeenCalledWith(error)
      expect(mockConsole.log).toHaveBeenCalledWith('Stack Trace:\n', 'custom stack')
    })
  })

  describe('ProdLogHandler', () => {
    it('uses a simpler format for production info/warn', () => {
      const handler = createProdLogHandler(mockConsole)
      const entry = buildLogEntry({
        severity: 'info',
        message: 'Hello Prod',
        timestamp: new Date('2026-02-04T12:00:00Z'),
      })

      handler(entry)

      // Note: toLocaleTimeString() output can vary by locale, so we match prefix and message
      expect(mockConsole.info).toHaveBeenCalledWith(expect.stringContaining('INFO: Hello Prod'))
    })

    it('uses console.error for production errors and fatals', () => {
      const handler = createProdLogHandler(mockConsole)
      const entry = buildLogEntry({
        severity: 'fatal',
        message: 'Production Crash',
      })

      handler(entry)

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Production Crash')
      )
    })
  })
})
