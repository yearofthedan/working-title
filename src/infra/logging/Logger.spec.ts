import { describe, expect, beforeEach, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { AppLogger } from './Logger'
import type { LogHandler } from './types'

describe('AppLogger', () => {
  let logger: AppLogger
  let mockHandler: LogHandler

  beforeEach(() => {
    mockHandler = vi.fn()
    logger = new AppLogger(mockHandler)
  })

  it('transforms fatal() calls into log entries', () => {
    const error = new Error('CRASH')
    error.stack = 'stack trace'
    const context = { operation: 'test' }

    logger.fatal(error, context)

    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'fatal',
        message: 'CRASH',
        error,
        context,
        stackTrace: 'stack trace',
      })
    )
  })

  it('handles error() being either an Error or a string', () => {
    const error = new Error('ERR')
    logger.error(error)
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        message: 'ERR',
        error,
      })
    )

    logger.error('plain string error')
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'error',
        message: 'plain string error',
      })
    )
  })

  it('transforms warning() and info() calls', () => {
    logger.warning('Careful')
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'warning',
        message: 'Careful',
      })
    )

    logger.info('FYI')
    expect(mockHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'info',
        message: 'FYI',
      })
    )
  })

  it('automatically adds a timestamp and environment', () => {
    logger.info('Test')

    const calls = vi.mocked(mockHandler).mock.calls
    expect(calls.length).toBeGreaterThan(0)
    const entry = calls[0]![0]
    expect(entry.timestamp).toBeInstanceOf(Date)
    expect(entry.environment).toBeDefined()
  })
})
