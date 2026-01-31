import { beforeEach, describe, it, vi, expect } from 'vitest'
import { ProjectStorage } from '../ProjectStorage'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { useProjectCreate } from './useProjectCreate'
import { InMemoryStorageProvider } from '@/infra/files/InMemoryStorageProvider'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

interface GivenContext {
  storage: ProjectStorage
  fileSystem: FileSystemStorageProvider
}

describe('useProjectCreate', () => {
  beforeEach((context: GivenContext) => {
    context.storage = new ProjectStorage(
      new InMemoryIndexedDBProvider() as unknown as IndexedDBProvider
    )
    context.fileSystem = new InMemoryStorageProvider({ treatAsReal: true })
  })

  describe('createProject', () => {
    it('creates a new project and saves it to file system and indexdb', async ({
      storage,
      fileSystem,
    }: GivenContext) => {
      const { createProject, lastSuccess } = useProjectCreate(storage, fileSystem)

      expect(lastSuccess.value).toBeNull()
      const metadata = await createProject('My New Project')

      expect(lastSuccess.value).not.toBeNull()

      const saved = await storage.loadById(metadata.id)
      expect(saved).toBeDefined()
      expect(saved?.meta.name).toBe('My New Project')
      expect(saved?.meta.created).toBe('2026-01-11T20:00:00Z')
    })

    it('throws error if template not found', async ({ storage, fileSystem }: GivenContext) => {
      const { createProject, state } = useProjectCreate(storage, fileSystem)

      await expect(createProject('My Project', 'non-existent')).rejects.toThrow()
      expect(state.value.status).toBe('error')
    })
  })
})
