import { beforeEach, describe, it, expect, vi } from 'vitest'
import { ProjectStorage } from '../ProjectStorage'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { useProjectDelete } from './useProjectDelete'
import { buildProjectData } from '../__testHelpers__/builders'

interface GivenContext {
  storage: ProjectStorage
}

describe('useProjectDelete', () => {
  beforeEach((context: GivenContext) => {
    context.storage = new ProjectStorage(
      new InMemoryIndexedDBProvider() as unknown as IndexedDBProvider
    )
  })

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

      await expect(deleteProject('p1')).rejects.toThrow('Delete failed')
      expect(state.value.status).toBe('error')
    })
  })
})
