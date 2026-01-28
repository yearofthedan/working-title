import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@/__testHelpers__/renderer'
import HomePage from './HomePage.vue'
import { projectStorage } from '@/features/writing-project/storage/ProjectStorage'

vi.mock('@/features/writing-project/storage/ProjectStorage', () => ({
  projectStorage: {
    listProjects: vi.fn(),
    loadCurrent: vi.fn(),
    save: vi.fn(),
  },
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('shows empty state when no projects exist', async () => {
    vi.mocked(projectStorage.listProjects).mockResolvedValue([])

    const result = render(HomePage)

    await expect.element(result.getByText('No projects yet')).toBeVisible()
  })

  it('displays project cards when projects exist', async () => {
    const mockProjects = [
      {
        id: 'proj-1',
        name: 'My Masterpiece',
        templateId: 'snowflake-method-v1',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-02T15:30:00Z',
      },
    ]
    vi.mocked(projectStorage.listProjects).mockResolvedValue(mockProjects)

    const result = render(HomePage)

    await expect.element(result.getByText('My Masterpiece')).toBeVisible()
    await expect.element(result.getByText('snowflake-method-v1')).toBeVisible()
    await expect.element(result.getByText(/2024/)).toBeVisible()
  })
})
