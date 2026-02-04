import { describe, expect, vi } from 'vitest'
import { type ProjectStore } from './store'
import { now } from '@/utils/dates'
import { buildInMemoryProjectStore } from './__testHelpers__/builders'
import { it as baseTest, type TestFixtures } from '@/__testHelpers__/fixtures'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(),
}))

type GivenContext = {
  store: ProjectStore
} & TestFixtures

const it = baseTest.extend<{
  store: ProjectStore
}>({
  store: async ({}, use) => {
    await use(buildInMemoryProjectStore())
  },
})

describe('ProjectStore', () => {
  it.scoped({ globalMocks: ['logging'] })

  describe('orchestration', () => {
    it('exposes expected operations', ({ store }: GivenContext) => {
      expect(store.createProject).toBeDefined()
      expect(store.updateProject).toBeDefined()
      expect(store.deleteProject).toBeDefined()
      expect(store.openProject).toBeDefined()
    })

    it('refreshes list when a project is created', async ({ store }: GivenContext) => {
      expect(store.projects.value).toHaveLength(0)

      await store.createProject('New Project')
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(store.projects.value).toHaveLength(1)
      expect(store.projects.value[0]?.name).toBe('New Project')
    })
  })

  describe('sorting', () => {
    it('sorts projects by updated date (newest first)', async ({ store }: GivenContext) => {
      vi.mocked(now).mockReturnValue('2026-01-02T20:00:00Z')
      await store.createProject('Middle')

      vi.mocked(now).mockReturnValue('2026-01-01T20:00:00Z')
      await store.createProject('Oldest')

      vi.mocked(now).mockReturnValue('2026-01-03T20:00:00Z')
      await store.createProject('Newest')

      await vi.waitFor(() => {
        expect(store.projects.value).toHaveLength(3)
      })

      expect(store.projects.value[0]?.name).toBe('Newest')
      expect(store.projects.value[1]?.name).toBe('Middle')
      expect(store.projects.value[2]?.name).toBe('Oldest')
    })
  })
})
