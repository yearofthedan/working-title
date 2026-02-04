import { describe, expect, vi } from 'vitest'
import { it, type GivenContext } from './__testHelpers__/fixtures'
import { useProjectCreate } from './useProjectCreate'

vi.mock('@/utils/dates', () => ({
  now: vi.fn(() => '2026-01-11T20:00:00Z'),
}))

describe('useProjectCreate', () => {
  it.scoped({ globalMocks: ['logging'] })

  describe('createProject', () => {
    it('creates a new project and saves it to file system and indexdb', async ({
      storage,
      fileSystem,
    }: GivenContext) => {
      const { createProject, lastSuccess } = useProjectCreate(storage, fileSystem)

      expect(lastSuccess.value).toBeNull()
      const metadata = await createProject('My New Project')

      expect(lastSuccess.value).not.toBeNull()

      const saved = await storage.loadById(metadata.id)
      expect(saved).toBeDefined()
      expect(saved?.meta.name).toBe('My New Project')
      expect(saved?.meta.created).toBe('2026-01-11T20:00:00Z')
    })

    it('throws error if template not found', async ({ storage, fileSystem }: GivenContext) => {
      const { createProject, state } = useProjectCreate(storage, fileSystem)

      await expect(createProject('My Project', 'non-existent')).rejects.toThrow()
      expect(state.value.status).toBe('error')
    })
  })
})
