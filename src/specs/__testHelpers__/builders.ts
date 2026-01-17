import type { ProjectData, Step, Connection } from '@/specs/projectDataSpec'

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
  schemaVersion: '1.0',
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
