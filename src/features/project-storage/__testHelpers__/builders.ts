import { InMemoryStorageProvider } from '@/infra/files/InMemoryStorageProvider'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { ProjectStorage, STORES } from '../ProjectStorage'
import { createProjectStore } from '../store'
import type { ProjectData, Step, Connection, ProjectMetadata } from '../types'

export const buildStep = (overrides: Partial<Step> = {}): Step => ({
  id: 'step-1',
  stepId: 'premise',
  content: { text: 'Test content' },
  ...overrides,
})

export const buildConnection = (overrides: Partial<Connection> = {}): Connection => ({
  id: 'conn-1',
  source: 'step-1',
  target: 'step-2',
  ...overrides,
})

export const buildMeta = (overrides: Partial<ProjectData['meta']> = {}) => ({
  name: 'Test Project',
  created: '2024-01-01',
  lastModified: '2024-01-01',
  ...overrides,
})

export const buildProjectData = (overrides: Partial<ProjectData> = {}): ProjectData => ({
  schemaVersion: '1.0.0',
  projectId: 'proj-1',
  templateId: 'test-template',
  templateVersion: '1.0',
  meta: buildMeta(),
  steps: [buildStep()],
  connections: [],
  ...overrides,
})

export const buildProjectMetadata = (
  overrides: Partial<ProjectMetadata> = {}
): ProjectMetadata => ({
  id: 'proj-1',
  name: 'Test Project',
  templateId: 'snowflake-method-v1',
  createdAt: '2024-01-01T12:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
  ...overrides,
})

export const buildInMemoryProjectStore = (
  options: {
    treatAsReal?: boolean
    delay?: number
    initialProjects?: ProjectMetadata[]
    storage?: ProjectStorage
  } = { treatAsReal: true }
) => {
  let storage = options.storage

  if (!storage) {
    const db = new InMemoryIndexedDBProvider() as unknown as IndexedDBProvider

    if (options.initialProjects) {
      options.initialProjects.forEach((p) => {
        db.setItem(p.id, p, STORES.REGISTRY)
      })
    }
    storage = new ProjectStorage(db)
  }

  return createProjectStore(storage, new InMemoryStorageProvider(options))
}
