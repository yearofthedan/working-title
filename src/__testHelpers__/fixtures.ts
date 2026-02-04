import { test as baseTest } from 'vitest'
import { AppLogger } from '@/infra/logging/Logger'
import { setGlobalLogger, resetGlobalLogger } from '@/infra/logging/globals'
import { vi } from 'vitest'
import { devLogHandler } from '@/infra/logging/handlers'
import type { LogEntry, LogHandler } from '@/infra/logging/types'

export interface TestFixtures {
  logHandler: LogHandler
  globalMocks: Array<'logging'>
}

export const it = baseTest.extend<TestFixtures>({
  globalMocks: [],

  logHandler: [
    async ({ globalMocks }, use) => {
      const shouldMock = globalMocks?.includes('logging')
      const handlerSpy = vi.fn().mockImplementation((entry: LogEntry) => {
        // Call through if it's meant to be using the real thing
        if (!shouldMock) {
          devLogHandler(entry)
        }
      })

      const logger = new AppLogger(handlerSpy)
      setGlobalLogger(logger)

      await use(handlerSpy)

      resetGlobalLogger()
    },
    { auto: true },
  ],
})
