import { describe, expect, vi } from 'vitest'
import { it, type GivenContext } from './__testHelpers__/fixtures'
import { useProjectOpen } from './useProjectOpen'
import { buildProjectData } from '../__testHelpers__/builders'

describe('useProjectOpen', () => {
  it.scoped({ globalMocks: ['logging'] })

  describe('openProject', () => {
    it('opens a project from file system and saves it to storage', async ({
      projectStorage,
      fileSystem,
    }: GivenContext) => {
      const mockHandle = await fileSystem.requestNewFileHandle('project.json')
      await fileSystem.writeAsJson(
        mockHandle,
        buildProjectData({
          projectId: 'p1',
          meta: { name: 'Test Project', created: '2024-01-01', lastModified: '2024-01-01' },
        })
      )

      vi.spyOn(fileSystem, 'requestOpenFileHandle').mockResolvedValue(mockHandle)

      const { openProject, lastSuccess } = useProjectOpen(projectStorage.instance, fileSystem)

      await openProject()

      expect(lastSuccess.value).toBeDefined()
      const saved = await projectStorage.instance.loadById('p1')
      expect(saved).toBeDefined()
    })

    it('errors if file is invalid', async ({ projectStorage, fileSystem }: GivenContext) => {
      const mockHandle = await fileSystem.requestNewFileHandle('invalid.json')
      await fileSystem.writeAsJson(mockHandle, { invalid: 'data' })
      vi.spyOn(fileSystem, 'requestOpenFileHandle').mockResolvedValue(mockHandle)

      const { openProject, state } = useProjectOpen(projectStorage.instance, fileSystem)
      await openProject()

      expect(state.value.status).toBe('error')
      expect(state.value.error?.message).toEqual('INVALID_PROJECT_FILE')
    })
  })
})
