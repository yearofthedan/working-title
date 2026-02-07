import { describe, expect, vi } from 'vitest'
import { it, type GivenContext } from './__testHelpers__/fixtures'
import { useProjectDelete } from './useProjectDelete'
import { buildProjectData } from '../__testHelpers__/builders'

describe('useProjectDelete', () => {
  it.scoped({ globalMocks: ['logging'] })

  describe('deleteProject', () => {
    it('deletes the project from projectStorage', async ({ projectStorage }: GivenContext) => {
      const project = buildProjectData({ projectId: 'p1' })
      await projectStorage.instance.save(project)

      const { deleteProject, lastSuccess } = useProjectDelete(projectStorage.instance)

      await deleteProject('p1')

      await expect(projectStorage.instance.loadById('p1')).rejects.toThrow()
      expect(lastSuccess.value).toBeDefined()
    })

    it('updates status to error if delete fails', async ({ projectStorage }: GivenContext) => {
      const { deleteProject, state } = useProjectDelete(projectStorage.instance)

      vi.spyOn(projectStorage.instance, 'delete').mockRejectedValue(new Error('Delete failed'))

      await deleteProject('p1')

      expect(state.value.status).toBe('error')
      expect(state.value.error?.message).toEqual('Delete failed')
    })
  })
})
