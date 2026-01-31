import { beforeEach, describe, it, expect } from 'vitest'
import { ProjectStorage } from '../ProjectStorage'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { useProjectList } from './useProjectList'
import { buildProjectData } from '../__testHelpers__/builders'

interface GivenContext {
  storage: ProjectStorage
}

describe('useProjectList', () => {
  beforeEach((context: GivenContext) => {
    context.storage = new ProjectStorage(
      new InMemoryIndexedDBProvider() as unknown as IndexedDBProvider
    )
    const project1 = buildProjectData({
      projectId: 'p1',
      meta: { name: 'P1', created: '2024-01-01', lastModified: '2024-01-01' },
    })
    const project2 = buildProjectData({
      projectId: 'p2',
      meta: { name: 'P2', created: '2024-01-01', lastModified: '2024-01-01' },
    })
    return Promise.all([context.storage.save(project1), context.storage.save(project2)])
  })

  it('lists projects from storage', async ({ storage }: GivenContext) => {
    const { state, refreshList } = useProjectList(storage)

    await refreshList()

    expect(state.value.status).toBe('success')
    expect(state.value.data).toHaveLength(2)
    expect(state.value.data).toContainEqual(expect.objectContaining({ id: 'p1' }))
    expect(state.value.data).toContainEqual(expect.objectContaining({ id: 'p2' }))
  })
})
