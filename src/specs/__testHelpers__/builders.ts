import type { ProjectData, Step, Connection } from '@/specs/projectDataSpec'
import type { ProcessTemplate, StepDefinition, TrackDefinition } from '@/specs/processTemplateSpec'

export const createStep = (overrides: Partial<Step> = {}): Step => ({
  id: 'step-1',
  stepId: 'premise',
  content: { text: 'Test content' },
  ...overrides,
})

export const createConnection = (overrides: Partial<Connection> = {}): Connection => ({
  id: 'conn-1',
  source: 'step-1',
  target: 'step-2',
  ...overrides,
})

export const createProjectData = (overrides: Partial<ProjectData> = {}): ProjectData => ({
  schemaVersion: '1.0',
  projectId: 'proj-1',
  templateId: 'test-template',
  templateVersion: '1.0',
  meta: {
    name: 'Test Project',
    created: '2024-01-01',
    lastModified: '2024-01-01',
  },
  steps: [createStep()],
  connections: [],
  ...overrides,
})

export const createStepDefinition = (overrides: Partial<StepDefinition> = {}): StepDefinition => ({
  id: 'premise',
  category: 'structure',
  stage: 1,
  labelText: 'step.premise.label',
  instructionText: 'step.premise.instruction',
  editorConfig: { format: 'rich', placeholderText: 'step.premise.placeholder' },
  ui: { visibility: ['canvas'] },
  actions: [],
  ...overrides,
})

export const createProcessTemplate = (
  overrides: Partial<ProcessTemplate> = {}
): ProcessTemplate => ({
  id: 'test-template',
  version: '1.0',
  nameText: 'test.name',
  descriptionText: 'test.description',
  rootActions: [],
  stepDefinitions: [],
  ui: { tracks: [] },
  ...overrides,
})

export const createTrackDefinition = (
  overrides: Partial<TrackDefinition> = {}
): TrackDefinition => ({
  id: 'track-1',
  rootStepIds: ['step-1'],
  layerOffset: 0,
  labelText: 'test.track.label',
  ...overrides,
})
