import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useStepActions } from './useStepActions'
import type { ProcessTemplate } from '@/features/process-templates/processTemplate'
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
} from '@/features/writing-project/domain/__testHelpers__/builders'
import { PROJECT_CONTEXT_KEY, projectContext } from './useProjectContext'
import { runWithContext } from '../__testHelpers__/providers'

describe('useStepActions', () => {
  const strings = ref({
    root: { action: { 1: 'Start Story' } },
    step: { 1: { action: { 1: 'Add Child' } } },
  })

  it('getRootActions returns mapped root actions from template and binds mutation correctly', () => {
    const project = ref(buildProjectData())
    const context = projectContext(project)
    const addStepSpy = vi.spyOn(context, 'addStep')

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

    runWithContext(
      () => {
        const { getRootActions } = useStepActions(template, strings)
        const actions = getRootActions()

        expect(actions).toHaveLength(1)
        expect(actions[0]!.trigger).toBe('append')
        expect(actions[0]!.label).toBe('Start Story')
        actions[0]!.execute()
        expect(addStepSpy).toHaveBeenCalledWith('step-1')
      },
      {
        [PROJECT_CONTEXT_KEY]: context,
      }
    )
  })

  it('getStepActions returns mapped actions for a specific step and binds mutation correctly', () => {
    const project = ref(buildProjectData())
    const context = projectContext(project)
    const addStepSpy = vi.spyOn(context, 'addStep')

    const template = ref<ProcessTemplate>(
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
    )

    runWithContext(
      () => {
        const { getStepActions } = useStepActions(template, strings)
        const actions = getStepActions('step-1', 'instance-1')

        expect(actions).toHaveLength(1)
        expect(actions[0]!.label).toBe('Add Child')
        expect(actions[0]!.id).toBe('step-action-add-child')

        actions[0]!.execute()
        expect(addStepSpy).toHaveBeenCalledWith('step-2', 'instance-1')
      },
      {
        [PROJECT_CONTEXT_KEY]: context,
      }
    )
  })

  it('getStepActions returns empty array if step definition not found', () => {
    const project = ref(buildProjectData())
    const template = ref<ProcessTemplate>(
      buildProcessTemplate({
        stepDefinitions: [],
      })
    )
    runWithContext(
      () => {
        const { getStepActions } = useStepActions(template, strings)
        const actions = getStepActions('non-existent', 'instance-1')
        expect(actions).toHaveLength(0)
      },
      {
        [PROJECT_CONTEXT_KEY]: projectContext(project),
      }
    )
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
      const project = ref(
        buildProjectData({
          steps: [buildStep({ id: 'instance-1', stepId: 'step-1' })],
          connections: [],
        })
      )

      runWithContext(
        () => {
          const { getAvailableActions } = useStepActions(template, strings)
          const actions = getAvailableActions('instance-1')

          expect(actions).toHaveLength(2)
          expect(actions.map((a) => a.trigger)).toContain('append')
          expect(actions.map((a) => a.trigger)).toContain('advance')
        },
        {
          [PROJECT_CONTEXT_KEY]: projectContext(project),
        }
      )
    })

    it('filters out advance action when an outbound connection exists', () => {
      const project = ref(
        buildProjectData({
          steps: [
            buildStep({ id: 'instance-1', stepId: 'step-1' }),
            buildStep({ id: 'instance-2', stepId: 'step-3' }),
          ],
          connections: [buildConnection({ source: 'instance-1', target: 'instance-2' })],
        })
      )

      runWithContext(
        () => {
          const { getAvailableActions } = useStepActions(template, strings)
          const actions = getAvailableActions('instance-1')

          expect(actions).toHaveLength(1)
          expect(actions[0]!.trigger).toBe('append')
        },
        {
          [PROJECT_CONTEXT_KEY]: projectContext(project),
        }
      )
    })

    it('always includes append actions even if connections exist', () => {
      const project = ref(
        buildProjectData({
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
      )

      runWithContext(
        () => {
          const { getAvailableActions } = useStepActions(template, strings)
          const actions = getAvailableActions('instance-1')

          expect(actions).toHaveLength(2)
          expect(actions.find((a) => a.trigger === 'append')).toBeDefined()
          expect(actions.find((a) => a.trigger === 'advance')).toBeDefined()
        },
        {
          [PROJECT_CONTEXT_KEY]: projectContext(project),
        }
      )
    })

    it('filters advance action only if connection to specific targetType exists', () => {
      const project = ref(
        buildProjectData({
          steps: [
            buildStep({ id: 'instance-1', stepId: 'step-1' }),
            buildStep({ id: 'instance-2', stepId: 'step-3' }), // instance-2 is step-3
          ],
          connections: [buildConnection({ source: 'instance-1', target: 'instance-2' })],
        })
      )

      runWithContext(
        () => {
          const { getAvailableActions } = useStepActions(template, strings)
          const actions = getAvailableActions('instance-1')

          expect(actions).toHaveLength(1)
          expect(actions[0]!.trigger).toBe('append')
        },
        {
          [PROJECT_CONTEXT_KEY]: projectContext(project),
        }
      )
    })

    it('returns empty array if step instance not found', () => {
      const project = ref(
        buildProjectData({
          steps: [],
          connections: [],
        })
      )

      runWithContext(
        () => {
          const { getAvailableActions } = useStepActions(template, strings)
          const actions = getAvailableActions('non-existent')
          expect(actions).toHaveLength(0)
        },
        {
          [PROJECT_CONTEXT_KEY]: projectContext(project),
        }
      )
    })
  })
})
