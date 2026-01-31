import { describe, it, expect, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { buildGlobals, runWithComponent } from '@/__testHelpers__/renderer'
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
  buildInMemoryProjectStore,
} from '@/features/project-storage/__testHelpers__/builders'
import {
  ACTIVE_PROJECT_CONTEXT_KEY,
  activeProjectContext,
  type ProjectContext,
} from './useActiveProjectContext'
import { buildProviders } from '@/__testHelpers__/builders'

describe('useStepActions', () => {
  const runComposable = (template: Ref<ProcessTemplate>, context: ProjectContext) => {
    return runWithComponent(() => useStepActions(template), {
      global: buildGlobals({
        provide: buildProviders({
          [ACTIVE_PROJECT_CONTEXT_KEY]: context,
        }),
      }),
    })
  }

  it('getRootActions returns mapped root actions from template and binds mutation correctly', () => {
    const project = ref(buildProjectData())
    const context = activeProjectContext(project, buildInMemoryProjectStore())
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

    const composable = runComposable(template, context)

    const actions = composable!.getRootActions()

    expect(actions).toHaveLength(1)
    expect(actions[0]!.trigger).toBe('append')
    actions[0]!.execute()
    expect(addStepSpy).toHaveBeenCalledWith('step-1')
  })

  it('getStepActions returns mapped actions for a specific step and binds mutation correctly', () => {
    const project = ref(buildProjectData())
    const context = activeProjectContext(project, buildInMemoryProjectStore())
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

    const composable = runComposable(template, context)
    const actions = composable.getStepActions('step-1', 'instance-1')

    expect(actions).toHaveLength(1)
    expect(actions[0]!.id).toBe('step-action-add-child')

    actions[0]!.execute()
    expect(addStepSpy).toHaveBeenCalledWith('step-2', 'instance-1')
  })

  it('getStepActions returns empty array if step definition not found', () => {
    const project = ref(buildProjectData())
    const template = ref<ProcessTemplate>(
      buildProcessTemplate({
        stepDefinitions: [],
      })
    )
    const composable = runComposable(
      template,
      activeProjectContext(project, buildInMemoryProjectStore())
    )
    const actions = composable.getStepActions('non-existent', 'instance-1')
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
      const project = ref(
        buildProjectData({
          steps: [buildStep({ id: 'instance-1', stepId: 'step-1' })],
          connections: [],
        })
      )

      const { getAvailableActions } = runComposable(
        template,
        activeProjectContext(project, buildInMemoryProjectStore())
      )
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(2)
      expect(actions.map((a: { trigger: 'append' | 'advance' }) => a.trigger)).toContain('append')
      expect(actions.map((a: { trigger: 'append' | 'advance' }) => a.trigger)).toContain('advance')
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

      const { getAvailableActions } = runComposable(
        template,
        activeProjectContext(project, buildInMemoryProjectStore())
      )
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(1)
      expect(actions[0]!.trigger).toBe('append')
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

      const { getAvailableActions } = runComposable(
        template,
        activeProjectContext(project, buildInMemoryProjectStore())
      )
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(2)
      expect(actions.find((a) => a.trigger === 'append')).toBeDefined()
      expect(actions.find((a) => a.trigger === 'advance')).toBeDefined()
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

      const { getAvailableActions } = runComposable(
        template,
        activeProjectContext(project, buildInMemoryProjectStore())
      )
      const actions = getAvailableActions('instance-1')

      expect(actions).toHaveLength(1)
      expect(actions[0]!.trigger).toBe('append')
    })

    it('returns empty array if step instance not found', () => {
      const project = ref(
        buildProjectData({
          steps: [],
          connections: [],
        })
      )

      const { getAvailableActions } = runComposable(
        template,
        activeProjectContext(project, buildInMemoryProjectStore())
      )
      const actions = getAvailableActions('non-existent')
      expect(actions).toHaveLength(0)
    })
  })
})
