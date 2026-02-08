import { test as baseTest } from 'vitest'
import { AppLogger } from '@/infra/logging/Logger'
import { setGlobalLogger, resetGlobalLogger } from '@/infra/logging/globals'
import { vi } from 'vitest'
import { devLogHandler } from '@/infra/logging/handlers'
import type { LogEntry, LogHandler } from '@/infra/logging/types'
import { type IIndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { ProjectStorage, STORAGE_CONFIG, STORES } from '@/features/project-storage/ProjectStorage'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { ProjectMetadata } from '@/features/project-storage/types'
import { TestFileStorageProvider } from '@/infra/files/__testHelpers__/builders'

export interface TestFixtures {
  logHandler: LogHandler
  globalMocks: Array<'logging' | 'storage' | 'fileStorage'>
  db: {
    instance: IIndexedDBProvider
    seedProjectMetadata: (...projects: ProjectMetadata[]) => Promise<void>
  }
  projectStorage: {
    instance: ProjectStorage
    seedProjectMetadata: (...projects: ProjectMetadata[]) => Promise<void>
  }
  fileStorage: TestFileStorageProvider
}

export const it = baseTest.extend<TestFixtures>({
  globalMocks: [],
  db: async ({}, use) => {
    const provider = new InMemoryIndexedDBProvider(STORAGE_CONFIG)

    const seedProjectMetadata = async (...projects: ProjectMetadata[]) => {
      await Promise.all(projects.map((p) => provider.setItem(p.id, p, STORES.REGISTRY)))
    }

    await use({
      instance: provider,
      seedProjectMetadata,
    })
  },
  fileStorage: async ({ globalMocks }, use) => {
    const fileStorage = new TestFileStorageProvider(50)

    if (globalMocks.includes('fileStorage')) {
      vi.spyOn(fileStorage, 'requestNewFileHandle')
      vi.spyOn(fileStorage, 'requestOpenFileHandle')
      vi.spyOn(fileStorage, 'writeAsJson')
      vi.spyOn(fileStorage, 'readAsJson')
    }
    await use(fileStorage)
  },
  projectStorage: async ({ db, globalMocks }, use) => {
    const storage = new ProjectStorage(db.instance)

    if (globalMocks.includes('storage')) {
      vi.spyOn(storage, 'save')
      vi.spyOn(storage, 'loadById')
      vi.spyOn(storage, 'listProjects')
      vi.spyOn(storage, 'delete')
    }

    await use({
      instance: storage,
      seedProjectMetadata: db.seedProjectMetadata,
    })
  },

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
