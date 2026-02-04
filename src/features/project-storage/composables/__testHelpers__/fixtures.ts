import { it as baseTest } from '@/__testHelpers__/fixtures'

import type { TestFixtures } from '@/__testHelpers__/fixtures'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'
import { InMemoryStorageProvider } from '@/infra/files/InMemoryStorageProvider'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { ProjectStorage } from '../../ProjectStorage'

export type GivenContext = {
  storage: ProjectStorage
  fileSystem: FileSystemStorageProvider
} & TestFixtures

export const it = baseTest.extend<{
  storage: ProjectStorage
  fileSystem: FileSystemStorageProvider
}>({
  storage: async ({}, use) => {
    await use(new ProjectStorage(new InMemoryIndexedDBProvider() as unknown as IndexedDBProvider))
  },
  fileSystem: async ({}, use) => {
    await use(new InMemoryStorageProvider({ treatAsReal: true }))
  },
})
