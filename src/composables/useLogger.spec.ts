import { describe, expect, vi } from 'vitest'
import { it } from '@/__testHelpers__/fixtures'
import { LOGGER_KEY, useLogger } from './useLogger'
import { runWithContext } from '@/__testHelpers__/renderer'
import type { Logger } from '@/infra/logging/types'

describe('useLogger', () => {
  it.scoped({ globalMocks: ['logging'] })

  it('provides a logger that defaults to the global logger', ({ logHandler }) => {
    runWithContext(() => {
      const injected = useLogger()
      injected.info('Falling back to global')
    })

    expect(logHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'info',
        message: 'Falling back to global',
      })
    )
  })

  it('allows overriding the logger via injection', ({ logHandler }) => {
    const customLogSpy = vi.fn()
    const mockLogger = { info: customLogSpy } as unknown as Logger

    runWithContext(
      () => {
        const logger = useLogger()
        logger.info('Using custom provider')
      },
      {
        global: {
          provide: {
            [LOGGER_KEY]: mockLogger,
          },
        },
      }
    )

    expect(customLogSpy).toHaveBeenCalledWith('Using custom provider')
    expect(logHandler).not.toHaveBeenCalled()
  })
})
