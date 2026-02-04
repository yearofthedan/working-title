import { describe, expect, vi } from 'vitest'
import { it, type GivenContext } from './__testHelpers__/fixtures'
import { useProjectDelete } from './useProjectDelete'
import { buildProjectData } from '../__testHelpers__/builders'

describe('useProjectDelete', () => {
  it.scoped({ globalMocks: ['logging'] })

  describe('deleteProject', () => {
    it('deletes the project from storage', async ({ storage }: GivenContext) => {
      const project = buildProjectData({ projectId: 'p1' })
      await storage.save(project)

      const { deleteProject, lastSuccess } = useProjectDelete(storage)

      await deleteProject('p1')

      await expect(storage.loadById('p1')).rejects.toThrow()
      expect(lastSuccess.value).toBeDefined()
    })

    it('updates status to error if delete fails', async ({ storage }: GivenContext) => {
      const { deleteProject, state } = useProjectDelete(storage)

      vi.spyOn(storage, 'delete').mockRejectedValue(new Error('Delete failed'))

      await deleteProject('p1')

      expect(state.value.status).toBe('error')
      expect(state.value.error?.message).toEqual('Delete failed')
    })
  })
})
