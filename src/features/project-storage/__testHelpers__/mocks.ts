import { vi } from 'vitest'
import type { ProjectStorage } from '../ProjectStorage'
import type { ProjectData } from '../types'
import { buildProjectMetadata } from './builders'

export const buildMockProjectStorage = (): ProjectStorage => {
  const mock = {
    listProjects: vi.fn().mockResolvedValue([]),
    loadById: vi.fn().mockRejectedValue(new Error('Project not found')),
    save: vi.fn().mockImplementation(async (data: ProjectData) => {
      return buildProjectMetadata({
        id: data.projectId,
        name: data.meta.name,
        templateId: data.templateId,
      })
    }),
    delete: vi.fn().mockResolvedValue(undefined),
    getFileHandle: vi.fn().mockResolvedValue(undefined),
  } as unknown as ProjectStorage

  return mock
}
