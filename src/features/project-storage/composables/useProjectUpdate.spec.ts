import { describe, expect, vi } from 'vitest'
import { it, type GivenContext } from './__testHelpers__/fixtures'
import { useProjectUpdate } from './useProjectUpdate'
import type { ProjectData } from '../types'
import { buildMeta, buildProjectData } from '../__testHelpers__/builders'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

describe('useProjectUpdate', () => {
  it.scoped({ globalMocks: ['logging'] })

  describe('updateProject', () => {
    it('updates the project in indexdb', async ({ storage, fileSystem }: GivenContext) => {
      const { updateProject } = useProjectUpdate(storage, fileSystem)

      await updateProject(
        buildProjectData({
          projectId: 'p1',
          meta: buildMeta({ name: 'Test Project' }),
        })
      )

      const saved = await storage.loadById('p1')
      expect(saved).toBeDefined()
      expect(saved?.meta.name).toBe('Test Project')
    })

    it('updates the last modified date', async ({ storage, fileSystem }: GivenContext) => {
      const { updateProject } = useProjectUpdate(storage, fileSystem)

      const updated = await updateProject(
        buildProjectData({
          projectId: 'p1',
          meta: buildMeta({ created: '2024-01-01', lastModified: '2024-01-01' }),
        })
      )

      expect(updated.meta.lastModified).toBe('2026-01-11T20:00:00Z')
    })

    it('updates the project in the file system if a handle exists', async ({
      storage,
      fileSystem,
    }: GivenContext) => {
      const mockHandle = await fileSystem.requestNewFileHandle('project.json')
      const projectData = buildProjectData()
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
    }: GivenContext) => {
      const { updateProject, lastSuccess } = useProjectUpdate(storage, fileSystem)

      expect(lastSuccess.value).toBeNull()

      await updateProject(buildProjectData())

      expect(lastSuccess.value).toEqual('2026-01-11T20:00:00Z')
    })
  })
})
