import { it as baseTest } from '@/__testHelpers__/fixtures'

import type { TestFixtures } from '@/__testHelpers__/fixtures'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'
import { TestFileStorageProvider } from '@/infra/files/__testHelpers__/builders'

export type GivenContext = {
  fileSystem: FileSystemStorageProvider
} & TestFixtures

export const it = baseTest.extend<{
  fileSystem: FileSystemStorageProvider
}>({
  fileSystem: async ({}, use) => {
    await use(new TestFileStorageProvider())
  },
})
