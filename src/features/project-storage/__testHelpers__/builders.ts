import { InMemoryStorageProvider } from '@/infra/files/InMemoryStorageProvider'
import { InMemoryIndexedDBProvider } from '@/infra/index-db/__testHelpers__/builders'
import type { IndexedDBProvider } from '@/infra/index-db/IndexedDBProvider'
import { ProjectStorage } from '../ProjectStorage'
import { createProjectStore } from '../store'
import type { ProjectData, Step, Connection } from '../types'

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

export const buildProjectData = (overrides: Partial<ProjectData> = {}): ProjectData => ({
  schemaVersion: '1.0.0',
  projectId: 'proj-1',
  templateId: 'test-template',
  templateVersion: '1.0',
  meta: {
    name: 'Test Project',
    created: '2024-01-01',
    lastModified: '2024-01-01',
  },
  steps: [buildStep()],
  connections: [],
  ...overrides,
})

export const buildInMemoryProjectStore = (
  options: { treatAsReal?: boolean; delay?: number } = { treatAsReal: true }
) =>
  createProjectStore(
    new ProjectStorage(new InMemoryIndexedDBProvider() as unknown as IndexedDBProvider),
    new InMemoryStorageProvider(options)
  )
