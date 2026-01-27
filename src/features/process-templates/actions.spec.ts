import { describe, it, expect } from 'vitest'
import { getCanvasRootActions } from './actions'
import { buildStep } from '../writing-project/storage/__testHelpers__/builders'
import {
  buildProcessTemplate,
  buildRootAction,
  buildStepDefinition,
} from './__testHelpers__/builders'

describe('getCanvasRootActions', () => {
  it('returns actions whose target has canvas visibility', () => {
    const template = buildProcessTemplate({
      rootActions: [
        buildRootAction({
          id: 'root-action-add-summary',
          targetType: 'step-summary',
          labelText: 'template.root.actions.create_summary',
        }),
      ],
      stepDefinitions: [
        buildStepDefinition({
          id: 'step-summary',
          ui: { visibility: ['canvas'] },
        }),
      ],
    })
    const actions = getCanvasRootActions(template, [])

    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      id: 'root-action-add-summary',
      targetType: 'step-summary',
      labelText: 'template.root.actions.create_summary',
    })
  })

  it('filters out actions whose target has sidebar-only visibility', () => {
    const template = buildProcessTemplate({
      rootActions: [buildRootAction({ targetType: 'step-genre' })],
      stepDefinitions: [buildStepDefinition({ id: 'step-genre', ui: { visibility: ['sidebar'] } })],
    })
    const actions = getCanvasRootActions(template, [])

    expect(actions).toHaveLength(0)
  })

  it('filters out actions whose target type already exists in project', () => {
    const template = buildProcessTemplate({
      rootActions: [buildRootAction({ targetType: 'step-summary' })],
      stepDefinitions: [
        buildStepDefinition({ id: 'step-summary', ui: { visibility: ['canvas'] } }),
      ],
    })
    const existingSteps = [
      buildStep({ id: 'existing', stepId: 'step-summary', content: { text: 'Summary text' } }),
    ]

    const actions = getCanvasRootActions(template, existingSteps)
    expect(actions).toHaveLength(0)
  })

  it('returns empty array when all canvas steps exist', () => {
    const template = buildProcessTemplate({
      rootActions: [buildRootAction({ targetType: 'step-summary' })],
      stepDefinitions: [
        buildStepDefinition({ id: 'step-summary', ui: { visibility: ['canvas'] } }),
      ],
    })
    const existingSteps = [buildStep({ id: '1', stepId: 'step-summary', content: { text: '' } })]

    const actions = getCanvasRootActions(template, existingSteps)
    expect(actions).toEqual([])
  })

  it('ignores sidebar-only steps when checking existence', () => {
    const template = buildProcessTemplate({
      rootActions: [
        buildRootAction({ targetType: 'step-summary' }),
        buildRootAction({ id: 'root-action-add-genre', targetType: 'step-genre' }),
      ],
      stepDefinitions: [
        buildStepDefinition({ id: 'step-summary', ui: { visibility: ['canvas'] } }),
        buildStepDefinition({ id: 'step-genre', ui: { visibility: ['sidebar'] } }),
      ],
    })
    const existingSteps = [
      buildStep({ id: '1', stepId: 'step-genre', content: { text: 'Fantasy' } }),
    ]

    const actions = getCanvasRootActions(template, existingSteps)

    expect(actions).toHaveLength(1)
    expect(actions[0]!.targetType).toBe('step-summary')
  })
})
