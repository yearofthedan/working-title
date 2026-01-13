import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useStepActions } from './useStepActions'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import type { ProjectMutations } from '@/features/story/composables/useProjectMutations'
import { buildProcessTemplate } from '@/specs/__testHelpers__/builders'
import {
  buildRootAction,
  buildStepAction,
  buildStepDefinition,
} from '@/features/process-templates/__testHelpers__/builders'

describe('useStepActions', () => {
  let mutations: ProjectMutations

  const strings = ref({
    root: { action: { 1: 'Start Story' } },
    step: { 1: { action: { 1: 'Add Child' } } },
  })

  beforeEach(() => {
    mutations = {
      addStep: vi.fn(),
      updateStepContent: vi.fn(),
      addConnection: vi.fn(),
    }
  })

  it('getRootActions returns mapped root actions from template and binds mutation correctly', () => {
    const template = ref<ProcessTemplate>(
      buildProcessTemplate({
        rootActions: [
          buildRootAction({
            id: 'root-action-1',
            labelText: 'root.action.1',
            trigger: 'append',
            targetType: 'step-1',
          }),
        ],
      })
    )

    const { getRootActions } = useStepActions(template, strings, mutations)
    const actions = getRootActions()

    expect(actions).toHaveLength(1)
    expect(actions[0]!.label).toBe('Start Story')
    actions[0]!.execute()
    expect(mutations.addStep).toHaveBeenCalledWith('step-1')
  })

  it('getStepActions returns mapped actions for a specific step and binds mutation correctly', () => {
    const { getStepActions } = useStepActions(
      ref<ProcessTemplate>(
        buildProcessTemplate({
          stepDefinitions: [
            buildStepDefinition({
              id: 'step-1',
              actions: [
                buildStepAction({
                  labelText: 'step.1.action.1',
                  targetType: 'step-2',
                  id: 'step-action-add-child',
                }),
              ],
            }),
          ],
        })
      ),
      strings,
      mutations
    )
    const actions = getStepActions('step-1', 'instance-1')

    expect(actions).toHaveLength(1)
    expect(actions[0]!.label).toBe('Add Child')
    expect(actions[0]!.id).toBe('step-action-add-child')

    actions[0]!.execute()
    expect(mutations.addStep).toHaveBeenCalledWith('step-2', 'instance-1')
  })

  it('getStepActions returns empty array if step definition not found', () => {
    const { getStepActions } = useStepActions(
      ref<ProcessTemplate>(
        buildProcessTemplate({
          stepDefinitions: [],
        })
      ),
      strings,
      mutations
    )
    const actions = getStepActions('non-existent', 'instance-1')
    expect(actions).toHaveLength(0)
  })
})
