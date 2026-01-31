import { beforeEach, describe, it, vi, expect } from 'vitest'
import { ProjectStorage } from '../ProjectStorage'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { useProjectUpdate } from './useProjectUpdate'
import { InMemoryStorageProvider } from '@/infra/files/InMemoryStorageProvider'
import type { FileSystemStorageProvider } from '@/infra/files/FileSystemStorageProvider'
import { buildProjectData } from '../__testHelpers__/builders'
import type { ProjectData } from '../types'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

interface GivenContext {
  storage: ProjectStorage
  fileSystem: FileSystemStorageProvider
  projectData: ProjectData
}

describe('useProjectUpdate', () => {
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
  describe('updateProject', () => {
    it('updates the project in indexdb', async ({
      storage,
      fileSystem,
      projectData,
    }: GivenContext) => {
      const { updateProject } = useProjectUpdate(storage, fileSystem)

      await updateProject(projectData)

      const saved = await storage.loadById('p1')
      expect(saved).toBeDefined()
      expect(saved?.meta.name).toBe('Test Project')
    })

    it('updates the last modified date', async ({
      storage,
      fileSystem,
      projectData,
    }: GivenContext) => {
      const { updateProject } = useProjectUpdate(storage, fileSystem)

      await updateProject(projectData)

      expect(projectData.meta.lastModified).toBe('2026-01-11T20:00:00Z')
    })

    it('updates the project in the file system if a handle exists', async ({
      storage,
      fileSystem,
      projectData,
    }: GivenContext) => {
      const mockHandle = await fileSystem.requestNewFileHandle('project.json')
      await storage.save(projectData, mockHandle)

      const { updateProject } = useProjectUpdate(storage, fileSystem)

      await updateProject({
        ...projectData,
        meta: {
          ...projectData.meta,
          name: 'Updated Title',
        },
      })

      const fileContent = await fileSystem.readAsJson<ProjectData>(mockHandle)
      expect(fileContent.meta.name).toBe('Updated Title')
    })

    it('updates the last success status after saving', async ({
      storage,
      fileSystem,
      projectData,
    }: GivenContext) => {
      const { updateProject, lastSuccess } = useProjectUpdate(storage, fileSystem)

      expect(lastSuccess.value).toBeNull()

      await updateProject(projectData)

      expect(lastSuccess.value).toEqual('2026-01-11T20:00:00Z')
    })
  })
})
