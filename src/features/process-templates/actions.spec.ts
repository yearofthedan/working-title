import { describe, it, expect } from 'vitest'
import { getCanvasRootActions } from './actions'
import { template } from './snowflake/template'
import { strings } from './snowflake/strings'
import { buildStep } from '../writing-project/domain/__testHelpers__/builders'

describe('getCanvasRootActions', () => {
  it('returns actions whose target has canvas visibility', () => {
    const actions = getCanvasRootActions(template, [], strings)

    expect(actions).toHaveLength(1)
    expect(actions[0]).toMatchObject({
      id: 'root-action-add-summary',
      targetType: 'step-summary',
      label: 'Create One Sentence Summary',
    })
  })

  it('filters out actions whose target has sidebar-only visibility', () => {
    const actions = getCanvasRootActions(template, [], strings)

    const targetTypes = actions.map((a) => a.targetType)
    expect(targetTypes).not.toContain('step-genre')
    expect(targetTypes).not.toContain('step-theme')
    expect(targetTypes).not.toContain('step-target-audience')
  })

  it('filters out actions whose target type already exists in project', () => {
    const existingSteps = [
      buildStep({ id: 'existing', stepId: 'step-summary', content: { text: 'Summary text' } }),
    ]

    const actions = getCanvasRootActions(template, existingSteps, strings)
    expect(actions).toHaveLength(0)
  })

  it('returns empty array when all canvas steps exist', () => {
    const existingSteps = [buildStep({ id: '1', stepId: 'step-summary', content: { text: '' } })]

    const actions = getCanvasRootActions(template, existingSteps, strings)
    expect(actions).toEqual([])
  })

  it('ignores sidebar-only steps when checking existence', () => {
    const existingSteps = [
      buildStep({ id: '1', stepId: 'step-genre', content: { text: 'Fantasy' } }),
      buildStep({ id: '2', stepId: 'step-theme', content: { text: 'Good vs Evil' } }),
    ]

    const actions = getCanvasRootActions(template, existingSteps, strings)

    expect(actions).toHaveLength(1)
    expect(actions[0]!.targetType).toBe('step-summary')
  })
})
