import { describe, expect, beforeEach } from 'vitest'
import { it, type GivenContext } from './__testHelpers__/fixtures'
import { useProjectList } from './useProjectList'
import { buildProjectData } from '../__testHelpers__/builders'

describe('useProjectList', () => {
  it.scoped({ globalMocks: ['logging'] })

  beforeEach(({ storage }: GivenContext) => {
    const project1 = buildProjectData({
      projectId: 'p1',
      meta: { name: 'P1', created: '2024-01-01', lastModified: '2024-01-01' },
    })
    const project2 = buildProjectData({
      projectId: 'p2',
      meta: { name: 'P2', created: '2024-01-01', lastModified: '2024-01-01' },
    })
    return Promise.all([storage.save(project1), storage.save(project2)])
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
