import type {
  ProcessTemplate,
  StepDefinition,
  TrackDefinition,
} from '@/features/process-templates/processTemplate'
import type { RootAction, StepAction } from '../types'

export const buildStepAction = (overrides: Partial<StepAction> = {}): StepAction => ({
  labelText: 'some-label-text',
  id: 'step-action-something',
  trigger: 'append',
  targetType: 'some-step-defn',
  ...overrides,
})

export const buildRootAction = (overrides: Partial<RootAction> = {}): RootAction => ({
  labelText: 'some-label-text',
  id: 'root-action-something',
  trigger: 'append',
  targetType: 'some-step-defn',
  ...overrides,
})

export const buildStepDefinition = (overrides: Partial<StepDefinition> = {}): StepDefinition => ({
  id: 'premise',
  category: 'structure',
  scope: 'paragraph',
  stage: 1,
  labelText: 'step.premise.label',
  instructionText: 'step.premise.instruction',
  editorConfig: { format: 'rich', placeholderText: 'step.premise.placeholder' },
  ui: { visibility: ['canvas'] },
  actions: [buildStepAction()],
  ...overrides,
})

export const buildProcessTemplate = (
  overrides: Partial<ProcessTemplate> = {}
): ProcessTemplate => ({
  id: 'test-template',
  version: '1.0',
  nameText: 'test.name',
  descriptionText: 'test.description',
  rootActions: [buildRootAction()],
  stepDefinitions: [buildStepDefinition()],
  ui: { tracks: [buildTrackDefinition()] },
  ...overrides,
})

export const buildTrackDefinition = (
  overrides: Partial<TrackDefinition> = {}
): TrackDefinition => ({
  id: 'track-1',
  rootStepIds: ['step-1'],
  layerOffset: 0,
  labelText: 'test.track.label',
  ...overrides,
})
