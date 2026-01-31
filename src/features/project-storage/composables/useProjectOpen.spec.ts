import { beforeEach, describe, it, vi, expect } from 'vitest'
import { ProjectStorage } from '../ProjectStorage'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { useProjectOpen } from './useProjectOpen'
import { InMemoryStorageProvider } from '@/infra/files/InMemoryStorageProvider'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'
import { buildProjectData } from '../__testHelpers__/builders'
import type { ProjectData } from '../types'

interface GivenContext {
  storage: ProjectStorage
  fileSystem: FileSystemStorageProvider
  projectData: ProjectData
}

describe('useProjectOpen', () => {
  beforeEach((context: GivenContext) => {
    context.storage = new ProjectStorage(
      new InMemoryIndexedDBProvider() as unknown as IndexedDBProvider
    )
    context.fileSystem = new InMemoryStorageProvider({ treatAsReal: true })
    context.projectData = buildProjectData({
      projectId: 'p1',
      meta: { name: 'Test Project', created: '2024-01-01', lastModified: '2024-01-01' },
    })
  })

  describe('openProject', () => {
    it('opens a project from file system and saves it to storage', async ({
      storage,
      fileSystem,
      projectData,
    }: GivenContext) => {
      const mockHandle = await fileSystem.requestNewFileHandle('project.json')
      await fileSystem.writeAsJson(mockHandle, projectData)

      vi.spyOn(fileSystem, 'requestOpenFileHandle').mockResolvedValue(mockHandle)

      const { openProject, lastSuccess } = useProjectOpen(storage, fileSystem)

      await openProject()

      expect(lastSuccess.value).toBeDefined()
      const saved = await storage.loadById('p1')
      expect(saved).toBeDefined()
    })

    it('throws error if file is invalid', async ({ storage, fileSystem }: GivenContext) => {
      const mockHandle = await fileSystem.requestNewFileHandle('invalid.json')
      await fileSystem.writeAsJson(mockHandle, { invalid: 'data' } as unknown as never)
      vi.spyOn(fileSystem, 'requestOpenFileHandle').mockResolvedValue(mockHandle)

      const { openProject, state } = useProjectOpen(storage, fileSystem)

      await expect(openProject()).rejects.toThrow('Invalid project file')
      expect(state.value.status).toBe('error')
    })
  })
})
