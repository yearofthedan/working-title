import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useStepActions } from './useStepActions'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
import type { ProjectMutations } from '@/features/story/composables/useProjectMutations'
import type { ProjectData } from '@/features/story/types'
import {
  buildRootAction,
  buildStepAction,
  buildStepDefinition,
  buildProcessTemplate,
} from '@/features/process-templates/__testHelpers__/builders'
import {
  buildProjectData,
  buildStep,
  buildConnection,
} from '@/features/story/__testHelpers__/builders'

describe('useStepActions', () => {
  let mutations: ProjectMutations
  const project = ref<ProjectData>(buildProjectData())

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

    const { getRootActions } = useStepActions(project, template, strings, mutations)
    const actions = getRootActions()

    expect(actions).toHaveLength(1)
    expect(actions[0]!.trigger).toBe('append')
    expect(actions[0]!.label).toBe('Start Story')
    actions[0]!.execute()
    expect(mutations.addStep).toHaveBeenCalledWith('step-1')
  })

  it('getStepActions returns mapped actions for a specific step and binds mutation correctly', () => {
    const { getStepActions } = useStepActions(
      project,
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
                  trigger: 'append',
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
      project,
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

  describe('getAvailableActions', () => {
    const template = ref<ProcessTemplate>(
      buildProcessTemplate({
        stepDefinitions: [
          buildStepDefinition({
            id: 'step-1',
            actions: [
              buildStepAction({
                id: 'step-action-append',
                trigger: 'append',
                labelText: 'step.1.action.1',
                targetType: 'step-2',
              }),
              buildStepAction({
                id: 'step-action-advance',
                trigger: 'advance',
                labelText: 'step.1.action.1',
                targetType: 'step-3',
              }),
            ],
          }),
        ],
      })
    )

    it('returns all actions when no connections exist', () => {
      project.value = buildProjectData({
        steps: [buildStep({ id: 'instance-1', stepId: 'step-1' })],
        connections: [],
      })

      const { getAvailableActions } = useStepActions(project, template, strings, mutations)
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(2)
      expect(actions.map((a) => a.trigger)).toContain('append')
      expect(actions.map((a) => a.trigger)).toContain('advance')
    })

    it('filters out advance action when an outbound connection exists', () => {
      project.value = buildProjectData({
        steps: [
          buildStep({ id: 'instance-1', stepId: 'step-1' }),
          buildStep({ id: 'instance-2', stepId: 'step-3' }),
        ],
        connections: [buildConnection({ source: 'instance-1', target: 'instance-2' })],
      })

      const { getAvailableActions } = useStepActions(project, template, strings, mutations)
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(1)
      expect(actions[0]!.trigger).toBe('append')
    })

    it('always includes append actions even if connections exist', () => {
      //TODO make the test data setup explicit so that it is clear what is going on in this test
      project.value = buildProjectData({
        steps: [
          buildStep({ id: 'instance-1', stepId: 'step-1' }),
          buildStep({ id: 'instance-2', stepId: 'step-2' }),
          buildStep({ id: 'instance-3', stepId: 'step-2' }),
        ],
        connections: [
          buildConnection({ source: 'instance-1', target: 'instance-2' }),
          buildConnection({ source: 'instance-1', target: 'instance-3' }),
        ],
      })

      const { getAvailableActions } = useStepActions(project, template, strings, mutations)
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(2)
      expect(actions.find((a) => a.trigger === 'append')).toBeDefined()
      expect(actions.find((a) => a.trigger === 'advance')).toBeDefined()
    })

    it('filters advance action only if connection to specific targetType exists', () => {
      //TODO make the test data setup explicit so that it is clear what is going on in this test
      project.value = buildProjectData({
        steps: [
          buildStep({ id: 'instance-1', stepId: 'step-1' }),
          buildStep({ id: 'instance-2', stepId: 'step-3' }), // instance-2 is step-3
        ],
        connections: [buildConnection({ source: 'instance-1', target: 'instance-2' })],
      })

      const { getAvailableActions } = useStepActions(project, template, strings, mutations)
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(1)
      expect(actions[0]!.trigger).toBe('append')
    })

    it('returns empty array if step instance not found', () => {
      project.value = buildProjectData({
        steps: [],
        connections: [],
      })

      const { getAvailableActions } = useStepActions(project, template, strings, mutations)
      const actions = getAvailableActions('non-existent')
      expect(actions).toHaveLength(0)
    })
  })
})
